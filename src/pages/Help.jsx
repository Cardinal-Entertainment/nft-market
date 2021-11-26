import React from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
  display: flex;
  color: white;

  h1 {
    margin-top: 0;
    margin-bottom: 10px;
  }
`;

const HelpPage = () => {
  return (
    <Container>
      <h1>Coming soon...</h1>
    </Container>
  );
};

export default HelpPage;
