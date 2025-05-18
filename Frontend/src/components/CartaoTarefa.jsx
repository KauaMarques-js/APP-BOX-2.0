import React from 'react';

export default function CartaoTarefa({ id, titulo, descricao, latitude, longitude, data }) {
  return (
    <div className="cartao-tarefa">
      <h3>{titulo}</h3>
      <p><strong>ID:</strong> {id}</p>
      <p><strong>Descrição:</strong> {descricao}</p>
      <p><strong>Latitude:</strong> {latitude}</p>
      <p><strong>Longitude:</strong> {longitude}</p>
      <p><strong>Data:</strong> {data}</p>
    </div>
  );
}
