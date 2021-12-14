import styled from 'styled-components';
import { CircularProgress, Modal } from '@mui/material';

const ModalContent = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  & > * {
    margin: 5px 0;
  }
`;

const LoadingModal = (props) => {
  const text = props.text || 'Loading...';
  const isOpen = props.open;
  const onClose = props.onClose;

  return (
    <Modal open={isOpen} onClose={onClose ? onClose : null}>
      <ModalContent>
        <div>{text}</div>
        <CircularProgress />
      </ModalContent>
    </Modal>
  );
};

export default LoadingModal;
