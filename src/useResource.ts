import {useEffect, useState} from 'react';

export function useResource<T>(key: string, load: (signal: AbortSignal) => Promise<T>) {
  const [revision, setRevision] = useState(0);
  const resourceKey = `${key}#${revision}`;
  const [state, setState] = useState<{key: string; data: T | null; loading: boolean; error: string}>({key: resourceKey, data: null, loading: true, error: ''});
  useEffect(() => {
    const controller = new AbortController();
    setState({key: resourceKey, data: null, loading: true, error: ''});
    load(controller.signal).then(data => {
      if (!controller.signal.aborted) setState({key: resourceKey, data, loading: false, error: ''});
    }).catch(error => {
      if (!controller.signal.aborted) setState({key: resourceKey, data: null, loading: false, error: error.message});
    });
    return () => controller.abort();
    // The key represents all loader inputs; inline loaders must not cause refetch loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, revision]);
  return {...(state.key === resourceKey ? state : {key: resourceKey, data: null, loading: true, error: ''}), retry: () => setRevision(v => v + 1)};
}
