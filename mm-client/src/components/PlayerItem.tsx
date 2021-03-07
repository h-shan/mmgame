import { Socket } from 'socket.io-client';
import React from 'react';
import Player from '../models/Player';
import { Col, Form, Row } from 'react-bootstrap';

const PlayerItem = ({
  player,
  self = false,
  socket
}: {
  player: Player;
  self: boolean;
  socket: Socket;
}) => {
  const changeName = (e: any) => {
    console.log('changeName', e);
    socket.emit('changeName', { id: player.id, name: e.target.value });
  };

  return (
    <Row className="player-item" key={player.id}>
      <Col>
        {self && (
          <Form.Control type="text" value={player.name} onChange={changeName} />
        )}
        {!self && <p className="player-name">{player.name}</p>}
      </Col>
      <Col>{player.points}</Col>
    </Row>
  );
};

export default PlayerItem;
