import React, { useState } from 'react';

const stateLinks: { [key: string]: string } = {
  Jammel: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d491447.05659522355!2d10.424481476717386!3d35.70722836633949!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13020f9d9c74a625%3A0x4e44cf01dcc1facc!2sEspace%20Wahiba%20show%20room!5e0!3m2!1sfr!2stn!4v1751192955510!5m2!1sfr!2stn', // replace with your link
  Sousse: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d491447.05659522355!2d10.424481476717386!3d35.70722836633949!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd8bd9797f4437%3A0x7c5c82d77c478715!2sSalon%20de%20coiffure%20Wahiba%20Hammam%20Sousse!5e0!3m2!1sfr!2stn!4v1751192847126!5m2!1sfr!2stn', // replace with your link
  Tunis: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1660463.8228113283!2d8.2194575!3d35.6254238!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12e2cb4ab7544f41%3A0xcd5c2a0dc02d39f4!2sSalon%20de%20coiffure%20Espace%20Wahiba%20Tunis!5e0!3m2!1sfr!2stn!4v1751192681157!5m2!1sfr!2stn',   // replace with your link
  Mahdia: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d491447.05659522355!2d10.424481476717386!3d35.70722836633949!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1302230060e50361%3A0x80bdf9cb60b728f8!2sEspace%20Wahiba%20Mahdia!5e0!3m2!1sfr!2stn!4v1751192915080!5m2!1sfr!2stn', // replace with your link
  Djerba: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1664326.8841781185!2d9.770644076340371!3d35.48544147827565!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13aaa50055de5ae3%3A0xb414fc03d12296a4!2sEspace%20Wahiba%20Djerba!5e0!3m2!1sfr!2stn!4v1751193001463!5m2!1sfr!2stn', // replace with your link
};


const states = Object.keys(stateLinks);

const StateMap: React.FC = () => {
  const [selectedState, setSelectedState] = useState(states[0]);

  return (
    <div>
      <div style={{ marginBottom: '1rem', flexWrap: 'wrap', display: 'flex', gap: '0.5rem' }}>
        {states.map((state) => (
          <button
            key={state}
            onClick={() => setSelectedState(state)}
            style={{
              marginRight: 0,
              marginBottom: '0.5rem',
              padding: '0.5rem 1rem',
              background: selectedState === state ? '#007bff' : '#eee',
              color: selectedState === state ? '#fff' : '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: '1 1 120px',
              minWidth: '100px',
              maxWidth: '180px',
              width: '100%',
            }}
          >
            📍{state}
          </button>
        ))}
      </div>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <div style={{ position: 'relative', width: '100%', paddingBottom: '66.66%', height: 0 }}>
          <iframe
            title="Google Map"
            src={stateLinks[selectedState]}
            style={{
              border: 0,
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              minHeight: 250,
              borderRadius: 8,
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default StateMap;
