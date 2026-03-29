import { useState, useCallback, useRef } from 'react';
import { ModelManager, ModelCategory, EventBus } from '@runanywhere/web';
import { useModelProgress } from '../components/ModelProgressContext';

export type LoaderState = 'idle' | 'downloading' | 'loading' | 'ready' | 'error' | 'paused';

export interface ModelLoaderResult {
  state: LoaderState;
  progress: number;
  error: string | null;
  ensure: () => Promise<boolean>;
  dispose: () => Promise<void>;
  preCache: () => Promise<boolean>;
  pause: () => void;
  resume: () => Promise<void>;
  activeDevice: 'webgpu' | 'cpu' | null;
  isCached: boolean;
}

const deviceMemory = (navigator as any).deviceMemory || 4;
export const LOW_RAM_MODE = deviceMemory <= 4;

export function useModelLoader(category: ModelCategory, coexist = false): ModelLoaderResult {
  const { dispatch } = useModelProgress();
  const [state, setState] = useState<LoaderState>(() => ModelManager.getLoadedModel(category) ? 'ready' : 'idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeDevice, setActiveDevice] = useState<'webgpu' | 'cpu' | null>(null);

  const loadingRef = useRef(false);
  const abortRef = useRef(false);
  const progressRef = useRef(0);
  const lastUpdateRef = useRef(0);

  const getTargetModel = useCallback(() => ModelManager.getModels().find((m) => m.modality === category), [category]);

  const mapStatus = (s: LoaderState): any => {
    const map = { idle: 'idle', downloading: 'downloading', loading: 'loading', ready: 'complete', error: 'error', paused: 'downloading' };
    return (map as any)[s] || 'idle';
  };

  const broadcastUpdate = useCallback((newState: LoaderState, newProgress?: number, errorMsg: string | null = null) => {
    setState(newState);
    if (newProgress !== undefined) {
      setProgress(newProgress);
      progressRef.current = newProgress;
    }
    if (errorMsg !== null) setError(errorMsg);

    dispatch({
      type: 'SET_PROGRESS',
      payload: {
        current: category.toUpperCase(),
        progress: newProgress ?? progressRef.current,
        status: mapStatus(newState)
      }
    });
  }, [category, dispatch]);

  const preCache = useCallback(async (): Promise<boolean> => {
    if (loadingRef.current) return false;
    loadingRef.current = true;

    const model = getTargetModel();
    if (!model) {
      broadcastUpdate('error', undefined, 'Model not found');
      loadingRef.current = false;
      return false;
    }

    if (model.status === 'downloaded' || model.status === 'loaded') {
      broadcastUpdate('ready', 100);
      loadingRef.current = false;
      return true;
    }

    let unsub: any;
    try {
      abortRef.current = false;
      broadcastUpdate('downloading', 0);

      unsub = EventBus.shared.on('model.downloadProgress', (evt) => {
        if (evt.modelId !== model.id || abortRef.current) return;
        const now = Date.now();
        const p = evt.progress ?? 0;
        if (now - lastUpdateRef.current < 200 && Math.abs(p - progressRef.current) < 1) return;

        lastUpdateRef.current = now;
        progressRef.current = p;
        setProgress(p);
        dispatch({
          type: 'SET_PROGRESS',
          payload: { current: category.toUpperCase(), progress: p, status: 'downloading' }
        });
      });

      await ModelManager.downloadModel(model.id);
      if (abortRef.current) {
        broadcastUpdate('paused', progressRef.current);
        return false;
      }

      broadcastUpdate('idle', 100);
      return true;
    } catch {
      broadcastUpdate('error', undefined, 'Download failed');
      return false;
    } finally {
      if (unsub) unsub();
      loadingRef.current = false;
    }
  }, [category, getTargetModel, broadcastUpdate, dispatch]);

  const ensure = useCallback(async (): Promise<boolean> => {
    if (ModelManager.getLoadedModel(category)) {
      broadcastUpdate('ready');
      return true;
    }
    if (loadingRef.current) return false;
    loadingRef.current = true;

    try {
      let model = getTargetModel();
      if (!model) throw new Error('No model');
      if (model.status !== 'downloaded' && model.status !== 'loaded') {
        const ok = await preCache();
        if (!ok) throw new Error('Pre-cache failed');
        model = getTargetModel();
      }

      broadcastUpdate('loading');
      const hasGPU = !!(navigator as any).gpu;
      const devices: ('webgpu' | 'cpu')[] = LOW_RAM_MODE ? ['cpu'] : hasGPU ? ['webgpu', 'cpu'] : ['cpu'];

      for (const device of devices) {
        try {
          const ok = await ModelManager.loadModel(model!.id, { device, coexist } as any);
          if (ok) {
            setActiveDevice(device);
            broadcastUpdate('ready');
            return true;
          }
        } catch { console.warn(`${device} failed`); }
      }
      throw new Error('Load failed');
    } catch (err: any) {
      broadcastUpdate('error', undefined, err.message);
      return false;
    } finally { loadingRef.current = false; }
  }, [category, preCache, getTargetModel, broadcastUpdate, coexist]);

  const pause = useCallback(() => {
    abortRef.current = true;
    broadcastUpdate('paused', progressRef.current);
  }, [broadcastUpdate]);

  const resume = useCallback(async () => {
    abortRef.current = false;
    await preCache();
  }, [preCache]);

  const dispose = useCallback(async () => {
    const model = getTargetModel();
    if (model && model.status === 'loaded') {
      await ModelManager.unloadModel(model.id);
      broadcastUpdate('idle', 0);
      setActiveDevice(null);
    }
  }, [getTargetModel, broadcastUpdate]);

  return { state, progress, error, ensure, dispose, preCache, pause, resume, activeDevice, isCached: !!getTargetModel()?.status?.includes('downloaded') };
}