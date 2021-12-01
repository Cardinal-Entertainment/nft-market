import { useQuery } from 'react-query';
import { QUERY_KEYS } from '../constants'

export const useFetchLiveFeeds = ( filterKey ) => useQuery({
    cacheTime: Infinity,
    queryFn: () => [],
    queryKey: [QUERY_KEYS.liveFeeds, { filterKey }],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
    refetchOnReconnect: false
});
