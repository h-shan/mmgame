import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const PlayPage: React.FC = () => {
  const [socket, setSocket] = useState((null as unknown) as Socket);

  useEffect(() => {
    const _socket = io('http://localhost:3000');
    _socket.on('connection', () => {
      console.log('connection made!');
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
      <div>Hello</div>
      <div>hi</div>
      <button onClick={connect}></button>
    </>
  );
};

export default PlayPage;
