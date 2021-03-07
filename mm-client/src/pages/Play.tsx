import React, { useEffect, useState } from 'react';
import {
  Col,
  Container,
  Form,
  Row,
  ButtonGroup,
  Button
} from 'react-bootstrap';
import { io, Socket } from 'socket.io-client';

import Player from '../models/Player';
import PlayerItem from '../components/PlayerItem';

class GameState {
  prompt: string = '';
  players: Player[] = [];
}

const PlayPage: React.FC = () => {
  const [idMe, setIdMe] = useState('unset');
  const [socket, setSocket] = useState((null as unknown) as Socket);
  const [gameState, setGameState] = useState(new GameState());

  useEffect(() => {
    const _socket = io('http://localhost:3000');
    _socket.on('connection', ({ id }: { id: string }) => {
      console.log('received connection');
      setIdMe(id);
      console.log('I am ', id);
    });

    _socket.on('state', (state: GameState) => {
      setGameState(state);
      console.log(state);
    });

    setSocket(_socket);
    console.log('socket');
  }, []);

  const changePrompt = (e: any) => {
    console.log('changePrompt', e.target.value);
    socket.emit('changePrompt', { prompt: e.target.value });
  };

  return (
    <>
      <Container>
        <Row>
          <Form.Control
            type="text"
            placeholder="Prompt"
            value={gameState.prompt}
            onChange={changePrompt}
          />
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
          <Col>Log</Col>
        </Row>
        <Row>
          <Col>
            {gameState.players
              .filter((player) => player.id === idMe)
              .map((player) => (
                <PlayerItem
                  key={player.id}
                  player={player}
                  self={true}
                  socket={socket}
                />
              ))}
            {gameState.players
              .filter((player) => player.id !== idMe)
              .map((player) => (
                <PlayerItem
                  key={player.id}
                  player={player}
                  self={false}
                  socket={socket}
                />
              ))}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PlayPage;
