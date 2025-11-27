import React, { useEffect, useState } from 'react';

interface Professor {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  area_atuacao: string;
  foto_perfil: string;
  formacao: string;
  link_curriculo: string;
  metodo_gravacao: string;
}

const AdminPainel = () => {
  const [professores, setProfessores] = useState<Professor[]>([]);

  const carregarPendentes = async () => {
    try {
      const resposta = await fetch('http://localhost:3001/professores/pendentes');
      const dados = await resposta.json();
      setProfessores(dados);
    } catch (err) {
      console.error('Erro ao buscar professores:', err);
    }
  };

  const aprovar = async (id: number) => {
  console.log("Aprovando professor com id:", id); // <-- AQUI!
  await fetch('http://localhost:3001/admin/professores/' + id + '/aprovar', {
    method: 'POST',
  });
  carregarPendentes();
};

const reprovar = async (id: number) => {
  console.log("Reprovando professor com id:", id); // <-- AQUI!
  await fetch('http://localhost:3001/admin/professores/' + id + '/reprovar', {
    method: 'POST',
  });
  carregarPendentes();
};
  useEffect(() => {
    carregarPendentes();
  }, []);

  return (
    <div style={{ padding: '40px' }}>
      <h2>Professores Pendentes</h2>
      {professores.length === 0 ? (
        <p>Nenhum professor pendente no momento.</p>
      ) : (
        professores.map((prof) => (
          <div key={prof.id} style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <img
              src={prof.foto_perfil}
              alt='Foto do professor'
              width='100'
              style={{ borderRadius: '8px' }}
              onError={(e: any) => e.target.style.display = 'none'}
            />
            <h3>{prof.nome} {prof.sobrenome}</h3>
            <p><strong>E-mail:</strong> {prof.email}</p>
            <p><strong>Área de atuação:</strong> {prof.area_atuacao}</p>
            <p><strong>Formação:</strong> {prof.formacao}</p>
            <p><strong>Link do currículo:</strong> <a href={prof.link_curriculo} target='_blank'>{prof.link_curriculo}</a></p>
            <p><strong>Gravação:</strong> {prof.metodo_gravacao}</p>

            <button
              onClick={() => aprovar(prof.id)}
              style={{
                marginRight: '10px',
                backgroundColor: 'green',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none'
              }}
            >
              Aprovar
            </button>
            <button
              onClick={() => reprovar(prof.id)}
              style={{
                backgroundColor: 'red',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none'
              }}
            >
              Reprovar
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminPainel;