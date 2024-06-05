// src/SensorDataChart.jsx
import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './App.css';

const SensorDataChart = () => {
  const [sensorData, setSensorData] = useState([]);
  const [chartInstances, setChartInstances] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(null);
  const [sendInterval, setSendInterval] = useState(null);

  const generateRandomInRange = (min, max) => Math.random() * (max - min) + min;

  const sendSensorData = async () => {
    const dadosSensor = {
      sensor_id: 1,
      temperatura: generateRandomInRange(20, 24),
      salinidade: generateRandomInRange(30, 36),
      ph: generateRandomInRange(7.5, 8.6),
      oxigenio: generateRandomInRange(8.8, 9.4),
      turbidez: generateRandomInRange(42.09, 215.16),
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('http://localhost:3000/inserir-dados-sensor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosSensor)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar dados do sensor: ' + response.statusText);
      }

      console.log('Dados do sensor enviados com sucesso.');
      fetchData(); // Atualiza os dados após enviar os novos dados
    } catch (error) {
      console.error('Erro ao enviar dados do sensor:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/dados-sensores');
      if (!response.ok) {
        throw new Error('Erro ao buscar dados: ' + response.statusText);
      }
      const data = await response.json();
      setSensorData(data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const deleteSensorData = async () => {
    try {
      const response = await fetch('http://localhost:3000/limpar-dados', {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar dados: ' + response.statusText);
      }

      console.log('Dados do sensor deletados com sucesso.');
      fetchData(); // Atualiza os dados após deletar os dados
    } catch (error) {
      console.error('Erro ao deletar dados do sensor:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (sensorData.length === 0) return;

    Object.values(chartInstances).forEach(chart => chart.destroy());

    const ctxTemperatura = document.getElementById('temperatura-chart');
    const ctxSalinidade = document.getElementById('salinidade-chart');
    const ctxPh = document.getElementById('ph-chart');
    const ctxOxigenio = document.getElementById('oxigenio-chart');
    const ctxTurbidez = document.getElementById('turbidez-chart');

    const chartOptions = {
      type: 'line',
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: 14 // Tamanho da fonte dos ticks do eixo Y
              }
            },
            title: {
              display: true,
              text: 'Valores',
              font: {
                size: 16 // Tamanho da fonte do título do eixo Y
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 14 // Tamanho da fonte dos ticks do eixo X
              }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: darkMode ? 'white' : 'black',
              font: {
                size: 16 // Tamanho da fonte das labels da legenda
              }
            }
          }
        }
      }
    };

    const newChartInstances = {
      temperatura: new Chart(ctxTemperatura, {
        ...chartOptions,
        data: {
          labels: sensorData.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
          datasets: [{
            label: 'Temperatura',
            data: sensorData.map(entry => entry.temperatura),
            borderColor: 'rgb(227, 15, 89)',
          }]
        }
      }),
      salinidade: new Chart(ctxSalinidade, {
        ...chartOptions,
        data: {
          labels: sensorData.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
          datasets: [{
            label: 'Salinidade',
            data: sensorData.map(entry => entry.salinidade),
            borderColor: 'rgb(54, 162, 235)',
          }]
        }
      }),
      ph: new Chart(ctxPh, {
        ...chartOptions,
        data: {
          labels: sensorData.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
          datasets: [{
            label: 'pH',
            data: sensorData.map(entry => entry.ph),
            borderColor: 'rgb(75, 192, 192)',
          }]
        }
      }),
      oxigenio: new Chart(ctxOxigenio, {
        ...chartOptions,
        data: {
          labels: sensorData.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
          datasets: [{
            label: 'Oxigênio',
            data: sensorData.map(entry => entry.oxigenio),
            borderColor: 'rgb(255, 206, 86)',
          }]
        }
      }),
      turbidez: new Chart(ctxTurbidez, {
        ...chartOptions,
        data: {
          labels: sensorData.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
          datasets: [{
            label: 'Turbidez',
            data: sensorData.map(entry => entry.turbidez),
            borderColor: 'rgb(153, 102, 255)',
          }]
        }
      })
    };

    setChartInstances(newChartInstances);
  }, [sensorData, darkMode]);

  const startUpdates = () => {
    if (!updateInterval) {
      const interval = setInterval(fetchData, 10000);
      setUpdateInterval(interval);
    }
  };

  const stopUpdates = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
      setUpdateInterval(null);
    }
  };

  const startSendingData = () => {
    if (!sendInterval) {
      const interval = setInterval(sendSensorData, 10000); // Envia dados a cada 10 segundos
      setSendInterval(interval);
    }
  };

  const stopSendingData = () => {
    if (sendInterval) {
      clearInterval(sendInterval);
      setSendInterval(null);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="button-container">
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
        <button onClick={sendSensorData}>Send Data</button>
        <button onClick={stopUpdates}>Stop Updates</button>
        <button onClick={startUpdates}>Start Updates</button>
        <button onClick={startSendingData}>Start Sending Data</button>
        <button onClick={stopSendingData}>Stop Sending Data</button>
        <button onClick={deleteSensorData}>Delete Data</button>
      </div>
      <div className="charts-container">
        <div className="chart-wrapper">
          <canvas id="temperatura-chart"></canvas>
        </div>
        <div className="chart-wrapper">
          <canvas id="salinidade-chart"></canvas>
        </div>
        <div className="chart-wrapper">
          <canvas id="ph-chart"></canvas>
        </div>
        <div className="chart-wrapper">
          <canvas id="oxigenio-chart"></canvas>
        </div>
        <div className="chart-wrapper">
          <canvas id="turbidez-chart"></canvas>
        </div>
        <div className="chart-wrapper">
        <iframe
         width="560"
         height="315"
         src="https://www.youtube.com/embed/S800sEVgFGI?autoplay=1&mute=1&controls=0&disablekb=1&iv_load_policy=3"
         title="YouTube video player"
         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
         allowFullScreen
        ></iframe>
        </div>
      </div>
    </div>
  );
};

export default SensorDataChart;
