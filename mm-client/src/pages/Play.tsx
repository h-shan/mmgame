import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Col,
  Container,
  Form,
  Row,
  Toast
} from 'react-bootstrap';
import { io, Socket } from 'socket.io-client';

import { rt2d } from '../global/util';
import Player from '../models/Player';
import PlayerItem from '../components/PlayerItem';

class GameState {
  prompt: string = '';
  players: Player[] = [];
  width: number = 0;
}

const PlayPage: React.FC = () => {
  const [idMe, setIdMe] = useState('unset');
  const [socket, setSocket] = useState((null as unknown) as Socket);
  const [gameState, setGameState] = useState(new GameState());
  const [bidWidth, setBidWidth] = useState(0);
  const [showBidWidthTooLargeToast, setShowBidWidthTooLargeToast] = useState(
    false
  );

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

  const submitWidth = () => {
    if (gameState.width && bidWidth > gameState.width * 0.9) {
      setShowBidWidthTooLargeToast(true);
    }
    socket.emit('bidWidth', { id: idMe, width: bidWidth });
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
          <Col>
            <Toast
              onClose={() => setShowBidWidthTooLargeToast(false)}
              show={showBidWidthTooLargeToast}
              delay={3000}
              autohide>
              <Toast.Header>
                <strong className="mr-auto">Bid width too large!</strong>
              </Toast.Header>
              <Toast.Body>
                Maximium bid width is {rt2d(0.9 * gameState.width)} because
                current min width is {rt2d(gameState.width)}.
              </Toast.Body>
            </Toast>
            <Form.Control
              type="number"
              value={bidWidth}
              placeholder="Width"
              onChange={(e) => {
                setBidWidth(Number(e.target.value));
              }}
            />
            {gameState.width !== 0 && (
              <Form.Text className="text-muted">
                Current best width: {gameState.width} - Max bid width:{' '}
                {rt2d(gameState.width * 0.9)}
              </Form.Text>
            )}
          </Col>
          <Col>
            <Button onClick={submitWidth}>Submit Width Bid</Button>
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
