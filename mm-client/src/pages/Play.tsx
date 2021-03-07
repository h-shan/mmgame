import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const PlayPage: React.FC = () => {
  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log(socket.connected); // true
    });

    console.log('hi');
    return () => {
      socket.disconnect();
    };
  }, []);
  const connect = () => {
    console.log('hi 2');
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
