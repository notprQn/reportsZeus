import React, { useState, useRef } from 'react';
import Modal from 'react-modal';
import './App.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';

function App() {
  const [scenarios, setScenarios] = useState([]);
  const [images, setImages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [title, setTitle] = useState('Titulo: ');
  const [given, setGiven] = useState('Dado que ');
  const [when, setWhen] = useState('Quando ');
  const [and, setAnd] = useState('E ');
  const [then, setThen] = useState('Então ');

  const inputRef = useRef([]);

  const openModal = () => {
    setTitle(`CT${scenarios.length + 1}: `);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(oldImages => [...oldImages, ...newImages]);
  };

  const handleAddScenario = () => {
    if (given.trim() === '' || when.trim() === '' || and.trim() === '' || then.trim() === '') {
      alert('Please fill in all the textareas.');
      return;
    }
  
    const scenario = {
      title,
      given,
      when,
      and,
      then,
      images,
    };
  
    if (editing !== null) {
      const newScenarios = [...scenarios];
      newScenarios[editing] = scenario;
      setScenarios(newScenarios);
      setEditing(null);
    } else {
      setScenarios(oldScenarios => [...oldScenarios, scenario]);
      setTitle(`CT ${scenarios.length + 2}: `);
    }
    setGiven('Dado que ');
    setWhen('Quando ');
    setAnd('E ');
    setThen('Então ');
    setImages([]);
    setModalIsOpen(false);
  };

  const handleTextChange = (e, index, field) => {
    const text = e.target.value;
    const newScenarios = [...scenarios];
  
    if (index >= 0 && index < newScenarios.length) {
      newScenarios[index][field] = text;
      setScenarios(newScenarios);
    } else {
      console.error(`Invalid index: ${index}`);
    }
  };

  const handleRemoveImage = (scenarioIndex, imageIndex) => {
    const newScenarios = [...scenarios];
    newScenarios[scenarioIndex].images.splice(imageIndex, 1);
    setScenarios(newScenarios);
  };

  const handleImageChange = (e, scenarioIndex, imageIndex) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const newScenarios = [...scenarios];
      newScenarios[scenarioIndex].images[imageIndex] = reader.result;
      setScenarios(newScenarios);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScenario = (index) => {
    const newScenarios = [...scenarios];
    newScenarios.splice(index, 1);
    setScenarios(newScenarios);
  };

  const downloadPdf = () => {
    const pdf = new jsPDF();
  
    scenarios.forEach((scenario, index) => {
      // Adicionar título do cenário com estilo
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 149, 237); // Cor azul claro (LightSkyBlue)
      pdf.text(20, 20, `${scenario.title}`);
  
      // Redefinir estilos para valores padrão
      pdf.setFont('helvetica');
      pdf.setTextColor(0);
  
      // Adicionar given, when, and, then
      pdf.setFontSize(14);
      pdf.text(20, 30, `${scenario.given}`);
      pdf.text(20, 40, `${scenario.when}`);
      pdf.text(20, 50, `${scenario.and}`);
      pdf.text(20, 60, `${scenario.then}`);
  
      // Adicionar imagens com largura próxima à página
      scenario.images.forEach((image, imageIndex) => {
        const yPos = 70 + imageIndex * 60;
        const imageWidth = pdf.internal.pageSize.getWidth() - 50; // Largura da imagem
        const imageHeight = 50; // Altura da imagem
        pdf.addImage(image, 'PNG', 20, yPos, imageWidth, imageHeight);
      });
  
      // Adicionar quebra de página após cada cenário (exceto o último)
      if (index < scenarios.length - 1) {
        pdf.addPage();
      }
    });
  
    // Salvar o PDF
    pdf.save('download.pdf');
  };





  return (
    
    <div className="App">
      
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Create Scenario"
      >
        <textarea 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
        />
        <textarea 
          value={given} 
          onChange={e => setGiven(e.target.value)} 
        />
        <textarea 
          value={when} 
          onChange={e => setWhen(e.target.value)} 
        />
        <textarea 
          value={and} 
          onChange={e => setAnd(e.target.value)} 
        />
        <textarea 
          value={then} 
          onChange={e => setThen(e.target.value)} 
        />
        <label htmlFor="fileUpload" className="fileUpload"> Importar Imagens
          <input id="fileUpload" type="file" onChange={handleImageUpload} multiple />
        </label>
        <button onClick={handleAddScenario}><i class="fas fa-plus"></i>Add Scenario</button>
        <button onClick={closeModal}><i class="fas fa-times"></i>Close</button>
      </Modal>
      
      {scenarios.map((scenario, index) => (
      <div key={index} id='content'>
        <div className = "hover-container">
          <div className="hover-button">
            <button onClick={() => handleRemoveScenario(index)}>Remove Scenario {index+1}</button>
          </div>
              
          <textarea 
            value={scenario.title} 
            onChange={e => handleTextChange(e, index, 'title')} 
            style={{
              width: '100%',
              minHeight: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '10px'
            }}
          />
          <textarea 
            value={scenario.given} 
            onChange={e => handleTextChange(e, index, 'given')} 
            style={{
              width: '100%',
              minHeight: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '10px'
            }}
          />
          <textarea 
            value={scenario.when} 
            onChange={e => handleTextChange(e, index, 'when')} 
            style={{
              width: '100%',
              minHeight: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '10px'
            }}
          />
          <textarea 
            value={scenario.and} 
            onChange={e => handleTextChange(e, index, 'and')} 
            style={{
              width: '100%',
              minHeight: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '10px'
            }}
          />
          <textarea 
            value={scenario.then} 
            onChange={e => handleTextChange(e, index, 'then')} 
            style={{
              width: '100%',
              minHeight: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '10px'
            }}
          />
        </div> 
        {scenario.images.map((image, imageIndex) => (
          <div key={imageIndex} className="image-container">
          <img src={image} alt="" />
          <div className="image-buttons">
            <button onClick={() => handleRemoveImage(index, imageIndex)}>
              <i className="fa fa-trash"></i>
            </button>
            <input type="file" style={{display: 'none'}} ref={input => inputRef.current[imageIndex] = input} onChange={e => handleImageChange(e, index, imageIndex)} />
            <button onClick={() => inputRef.current[imageIndex].click()}>
              <i className="fa fa-pencil-alt"></i>
            </button>
          </div>
        </div>
        ))}
      </div>
    ))}
    <button onClick={openModal}>Create Scenario</button>
    <button onClick={downloadPdf}>Generate PDF</button>
    </div>
  );
}

export default App;