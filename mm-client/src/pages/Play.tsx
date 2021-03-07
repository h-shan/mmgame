import React, { useEffect, useState } from 'react';
import {
  Col,
  Container,
  InputGroup,
  Row,
  ButtonGroup,
  Button
} from 'react-bootstrap';
import { io, Socket } from 'socket.io-client';

class Player {
  id: string = '';
  name: string = '';
  points: number = 0;
}

class GameState {
  players: Player[] = [];
}

const PlayPage: React.FC = () => {
  const [socket, setSocket] = useState((null as unknown) as Socket);
  const [gameState, setGameState] = useState(new GameState());

  useEffect(() => {
    const _socket = io('http://localhost:3000');
    _socket.on('connection', () => {
      console.log('received connection');
    });
    _socket.on('state', (state: GameState) => {
      setGameState(state);
      console.log(state);
    });

    setSocket(_socket);
    console.log('socket');
  }, []);

  const connect = () => {
    console.log('connect');
    socket.emit('hello', { code: 123 });
  };

  return (
    <>
      <Container>
        <Row>
          <h1>Prompt</h1>
        </Row>
        <Row>
          <h2>Market is 100@200</h2>
          <Col>
            <Button variant="primary">Buy</Button>
          </Col>
          <Col>
            <Button variant="secondary">Sell</Button>
          </Col>
        </Row>
        <Row>
          <Col xs={3}>
            {gameState.players.map((player) => (
              <Row key={player.id}>
                {player.name}: {player.points}
              </Row>
            ))}
            <Row>Player 1</Row>
          </Col>
          <Col>Log</Col>
        </Row>
      </Container>
    </>
  );
};

export default PlayPage;
