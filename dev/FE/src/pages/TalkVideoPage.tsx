import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import ReactPlayer from 'react-player';
import PageHeader from '@/components/navbar/PageHeader';
import { SmallButton, TalkBubble } from '@/components/common';
import Modal from '@/components/common/Modal';
import { History } from '@/types/talk';
import { ModelInformation } from '@/types/peopleList';
import { getPeopleInfo } from '@/api/peoplelist';
import { startConversation } from '@/api/talk';
import Dictaphone from '@/components/talk/Dictaphone';

const Wrapper = styled.div`
  background-color: var(--primary-color);
  padding-top: 1vh;
  height: 100vh;
`;

const TitleWrapper = styled.div`
  width: 100%;
  height: 60vh;
`;

const VideoWrapper = styled.div<{ $reverse: boolean }>`
  margin: 0 auto;
  width: 86vw;
  height: 12.5rem;
  background-color: #fff;
  transform: rotate(${(props) => (props.$reverse ? '180deg' : '0deg')});
`;

const ReverseButton = styled.button`
  margin-left: 85vw;
  width: 2rem;
  height: 2rem;
  border-radius: 100%;
  background-color: #f6f6f6;
  background-image: url('/icon/reverse_icon.svg');
  background-repeat: no-repeat;
  background-size: 80%;
  background-position: center;
  border: 0;
`;

const ContentWrpper = styled.div`
  width: 100%;
  height: 55vh;
  background-color: #fff;
`;

const ButtonWrapper = styled.div`
  margin: 0 auto;
  width: 86vw;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
`;

const TalkVideoPage = () => {
  const navigate = useNavigate();
  const { modelNo } = useParams();
  const MySwal = withReactContent(Swal);

  const [isOpenTalkHistoryModal, setIsOpentalkHistoryModal] =
    useState<boolean>(false);
  const [talkHistory, setTalkHistory] = useState<History[]>([]);
  const { data: modelInfomation } = useQuery<ModelInformation>(
    ['getModelInfo'],
    () => getPeopleInfo(Number(modelNo)),
  );
  const [conversationNo, setConversationNo] = useState<number>(0);
  const [reverseVideo, setReverseVideo] = useState<boolean>(false);
  const defaultVideoSrc = modelInfomation?.commonVideoPath;

  const [videoSrc, setVideoSrc] = useState<string | undefined>(defaultVideoSrc);

  useEffect(() => {
    startConversation(Number(modelNo), 'voice')
      .then((res) => {
        setConversationNo(res.data.conversationNo);
      })
      .catch(() => {});

    return () => {
      setVideoSrc(undefined);
    };
  }, []);
  const pushHistory = (text: string, speakerType: number) => {
    setTalkHistory((prevState: History[]) => {
      if (speakerType === 1) {
        return [...prevState, { '나 ': text }];
      }
      return [...prevState, { '상대방 ': text }];
    });
  };

  const headerContent = {
    left: '',
    title: modelInfomation?.modelName ?? '로딩중',
    right: '',
  };

  useEffect(() => {
    if (modelInfomation?.commonVideoPath && !videoSrc) {
      setVideoSrc(modelInfomation.commonVideoPath);
    }
  }, [modelInfomation]);

  const handleEndConversation = () => {
    MySwal.fire({
      title: '대화를 종료하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '네',

      customClass: {
        title: 'swal2-title-custom',
      },

      cancelButtonText: `취소`,
    })
      .then((result) => {
        if (result.isConfirmed) {
          navigate('/board');
        }
      })
      .catch(() => {});
  };
  const handleCloseTalkHistory = () => {
    setIsOpentalkHistoryModal(false);
  };
  const handleReverseVideo = () => {
    setReverseVideo(!reverseVideo);
  };

  return (
    <Wrapper>
      <TitleWrapper>
        <PageHeader content={headerContent} type={2} />
        <ReverseButton onClick={handleReverseVideo} />

        <VideoWrapper $reverse={reverseVideo}>
          {videoSrc && (
            <ReactPlayer
              url={[{ src: videoSrc, type: 'video/mp4' }]}
              playing
              controls
              loop={videoSrc === defaultVideoSrc}
              onEnded={() => {
                if (videoSrc !== defaultVideoSrc) {
                  setVideoSrc(defaultVideoSrc);
                }
              }}
              width="100%"
              height="100%"
            />
          )}
        </VideoWrapper>
      </TitleWrapper>
      <ContentWrpper>
        <Dictaphone
          setVideoSrc={setVideoSrc}
          pushHistory={pushHistory}
          modelInformation={modelInfomation}
          conversationNo={conversationNo}
        />
        <ButtonWrapper>
          <SmallButton
            type={1}
            text="대화 내역"
            onClick={() => setIsOpentalkHistoryModal(true)}
          />
          <SmallButton
            type={2}
            onClick={handleEndConversation}
            text="대화 종료"
          />
        </ButtonWrapper>
      </ContentWrpper>
      {isOpenTalkHistoryModal && (
        <Modal onClose={handleCloseTalkHistory}>
          <TalkBubble
            conversation={talkHistory}
            imagePath={modelInfomation?.imagePath}
          />
        </Modal>
      )}
    </Wrapper>
  );
};

export default TalkVideoPage;
