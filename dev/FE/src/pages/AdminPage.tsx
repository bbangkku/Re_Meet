import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { createBasicVideo, createHeygenId, getHeygenId } from '@/api/admin';
import HeyModel from '@/types/admin';
import useAuth from '@/hooks/useAuth';

const AdminPage = () => {
  const client = useQueryClient();
  const { data: modelList } = useQuery<AxiosResponse<HeyModel[]>>(
    ['getModelList'],
    getHeygenId,
  );
  const { userInfo } = useAuth();
  const createHeyIdMutation = useMutation(createHeygenId, {
    onSuccess: () => {
      client
        .invalidateQueries({ queryKey: ['getModelList'] })
        .then(() => {})
        .catch(() => {});
    },
    onError: () => {},
  });
  const createVideoMutation = useMutation(createBasicVideo, {
    onSuccess: () => {
      client
        .invalidateQueries({ queryKey: ['getModelList'] })
        .then(() => {})
        .catch(() => {});
    },
    onError: () => {},
  });
  const handleCreateHeyId = (data: HeyModel) => {
    createHeyIdMutation.mutate(data);
  };
  const handleCreateBasicVideo = (data: HeyModel) => {
    createVideoMutation.mutate(data);
  };

  return (
    <div>
      <h1>어드민 페이지</h1>
      {modelList &&
        modelList.data.map((item) => {
          const data = {
            ...item,
            userNo: userInfo?.userNo,
          };
          return (
            <div key={item.modelNo}>
              <span>{item.modelNo}</span>
              <span>{item.modelName}</span>
              <button onClick={() => handleCreateHeyId(data)}>
                헤이아이디 만들기
              </button>
              <button onClick={() => handleCreateBasicVideo(data)}>
                기본 비디오 만들기
              </button>
            </div>
          );
        })}
    </div>
  );
};

export default AdminPage;
