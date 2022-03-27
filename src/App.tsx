import React, { useState, useEffect } from 'react';
import './App.css';
import Chessboard from 'chessboardjsx';

import { ChessInstance, ShortMove } from "chess.js";
import * as signalR from "@microsoft/signalr";

const Chess = require("chess.js");

const App: React.FC = () => {

  useEffect(() => {
    if(hubConnection) {
      hubConnection.on("setNewMove", message => {
        console.log(message);
        setFen(message);
      })
    }
  });

  const hubConnection = new signalR.HubConnectionBuilder()
  .withUrl("https://localhost:7280/chesshub") 
  .build();
 
  // Starts the SignalR connection
  hubConnection.start().then(a => {
    // Once started, invokes the sendConnectionId in our ChatHub inside our ASP.NET Core application.
    if (hubConnection.connectionId) {
      hubConnection.invoke("SendConnectionId", hubConnection.connectionId);
    }   
  });
  
  const [chess] = useState<ChessInstance> (
    new Chess()
  );

  const [fen, setFen] = useState(chess.fen());

  const resetBoard = () => {
    chess.reset();
    setFen(chess.fen());
  }

  const handleMove = async (move: ShortMove) => {
    if (chess.move(move)) {
      setFen(chess.fen());
      if(hubConnection) {
        await hubConnection.invoke("SendMove", chess.fen());
      }
    }
  };


  return (
    <div style={{
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                flexDirection: "column", 
                width: "100vw",       
                height: "100vh"
                }}
    >
      <Chessboard position={fen}
                  onDrop={(move) => 
                  handleMove({
                    from: move.sourceSquare,
                    to: move.targetSquare,
                    promotion: "q"
                  })} 
      />
      <button onClick={resetBoard}>Reset</button>          
    </div>
  );
}

export default App;
