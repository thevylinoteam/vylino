import { VylinoMarketingSyncService } from './vylino-marketing-sync.service';

describe('VylinoMarketingSyncService', () => {
  const previousEnabled = process.env.VYLINO_MARKETING_SYNC_ENABLED;

  afterEach(() => {
    jest.restoreAllMocks();
    if (previousEnabled === undefined) {
      delete process.env.VYLINO_MARKETING_SYNC_ENABLED;
    } else {
      process.env.VYLINO_MARKETING_SYNC_ENABLED = previousEnabled;
    }
  });

  const makeState = () => ({
    acquireLock: jest.fn().mockResolvedValue('lock-token'),
    releaseLock: jest.fn().mockResolvedValue(undefined),
    markSkipped: jest.fn().mockResolvedValue(undefined),
    markRunning: jest.fn().mockResolvedValue(undefined),
    markSucceeded: jest.fn().mockResolvedValue(undefined),
    markFailed: jest.fn().mockResolvedValue(undefined),
  });

  const makeExecutor = () => ({
    isConfigured: jest.fn().mockReturnValue(true),
    execute: jest.fn().mockResolvedValue({
      ok: true,
      processedRecords: 18,
      processedSnapshots: 7,
      createdSnapshots: 2,
      updatedSnapshots: 5,
      providers: ['GOOGLE_ADS', 'META_ADS'],
      range: { startDate: '2026-08-18', endDate: '2026-09-16' },
    }),
  });

  it('skips when automation is disabled', async () => {
    process.env.VYLINO_MARKETING_SYNC_ENABLED = 'false';
    const state = makeState();
    const executor = makeExecutor();
    const service = new VylinoMarketingSyncService(
      state as never,
      executor as never,
    );

    await expect(service.run('scheduled')).resolves.toMatchObject({
      skipped: true,
      reason: 'marketing_sync_disabled',
    });

    expect(state.markSkipped).toHaveBeenCalledWith(
      'scheduled',
      'marketing_sync_disabled',
    );
    expect(executor.execute).not.toHaveBeenCalled();
  });

  it('skips when no paid-marketing provider is configured', async () => {
    process.env.VYLINO_MARKETING_SYNC_ENABLED = 'true';
    const state = makeState();
    const executor = makeExecutor();
    executor.isConfigured.mockReturnValue(false);
    const service = new VylinoMarketingSyncService(
      state as never,
      executor as never,
    );

    await expect(service.run('manual')).resolves.toMatchObject({
      skipped: true,
      reason: 'marketing_sync_not_configured',
    });

    expect(state.acquireLock).not.toHaveBeenCalled();
  });

  it('does not start a duplicate sync when the distributed lock is held', async () => {
    process.env.VYLINO_MARKETING_SYNC_ENABLED = 'true';
    const state = makeState();
    state.acquireLock.mockResolvedValue(null);
    const executor = makeExecutor();
    const service = new VylinoMarketingSyncService(
      state as never,
      executor as never,
    );

    await expect(service.run('scheduled')).resolves.toMatchObject({
      skipped: true,
      reason: 'marketing_sync_already_running',
    });

    expect(executor.execute).not.toHaveBeenCalled();
  });

  it('records successful live provider execution and releases the lock', async () => {
    process.env.VYLINO_MARKETING_SYNC_ENABLED = 'true';
    const state = makeState();
    const executor = makeExecutor();
    const service = new VylinoMarketingSyncService(
      state as never,
      executor as never,
    );

    await expect(service.run('manual')).resolves.toMatchObject({
      ok: true,
      skipped: false,
      processedRecords: 18,
      processedSnapshots: 7,
    });

    expect(state.markRunning).toHaveBeenCalledWith(
      'manual',
      expect.any(String),
    );
    expect(state.markSucceeded).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: 'manual',
        processedRecords: 18,
        processedSnapshots: 7,
        createdSnapshots: 2,
        updatedSnapshots: 5,
      }),
    );
    expect(state.releaseLock).toHaveBeenCalledWith('lock-token');
  });

  it('records failures and still releases the distributed lock', async () => {
    process.env.VYLINO_MARKETING_SYNC_ENABLED = 'true';
    const state = makeState();
    const executor = makeExecutor();
    executor.execute.mockRejectedValue(new Error('Meta API unavailable'));
    const service = new VylinoMarketingSyncService(
      state as never,
      executor as never,
    );

    await expect(service.run('scheduled')).rejects.toThrow(
      'Meta API unavailable',
    );

    expect(state.markFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: 'scheduled',
        error: 'Meta API unavailable',
      }),
    );
    expect(state.releaseLock).toHaveBeenCalledWith('lock-token');
  });
});
