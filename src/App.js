import React, { useState, useRef } from 'react';
import Modal from 'react-modal';
import './App.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const pdf = new jsPDF('landscape');

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

  const handleTextChange = (e, scenarioIndex, field) => {
    const newScenarios = [...scenarios];
    newScenarios[scenarioIndex][field] = e.target.textContent;
    setScenarios(newScenarios);
  };

  const handleRemoveImage = (scenarioIndex, imageIndex) => {
    const newScenarios = [...scenarios];
    newScenarios[scenarioIndex].images.splice(imageIndex, 1);
    setScenarios(newScenarios);
  };

  const handleImageChange = (e, scenarioIndex, imageIndex) => {
    const files = Array.from(e.target.files);
    const newScenarios = [...scenarios];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newScenarios[scenarioIndex].images.push(reader.result);
        setScenarios(newScenarios);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveScenario = (index) => {
    const newScenarios = [...scenarios];
    newScenarios.splice(index, 1);
    setScenarios(newScenarios);
  };

  const generatePDF = () => {
    // Hide buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.style.display = 'none');
  
    // Select the body of the document
    const element = document.body;
  
    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // Initialize pdf first
    
      const imgProps= pdf.getImageProperties(imgData); // Then get image properties
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
      let heightLeft = imgProps.height;
      let position = 0;
    
      while (heightLeft >= 0) {
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdfHeight;
        position -= pdfHeight;
    
        if (heightLeft > 0) {
          pdf.addPage();
        }
      }
    
      pdf.save("download.pdf");
    
      // Show buttons
      buttons.forEach(button => button.style.display = '');
    });
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
      <div key={index} >
        <h2 contentEditable={true} onBlur={e => handleTextChange(e, index, 'title')}>
          {scenario.title} 
        </h2>
        <button onClick={() => handleRemoveScenario(index)}>Remove Scenario {index+1}</button>
        <p contentEditable={true} onBlur={e => handleTextChange(e, index, 'given')}>
          {scenario.given.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
        </p>
        <p contentEditable={true} onBlur={e => handleTextChange(e, index, 'when')}>
          {scenario.when.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
        </p>
        <p contentEditable={true} onBlur={e => handleTextChange(e, index, 'and')}>
          {scenario.and.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
        </p>
        <p contentEditable={true} onBlur={e => handleTextChange(e, index, 'then')}>
          {scenario.then.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
        </p>
        
        {scenario.images.map((image, imageIndex) => (
          <div key={imageIndex}>
            <img src={image} alt="" />
            <button onClick={() => handleRemoveImage(index, imageIndex)}>
              <i className="fa fa-trash"></i>
            </button>
            <input type="file" style={{display: 'none'}} ref={input => inputRef.current[imageIndex] = input} onChange={e => handleImageChange(e, index, imageIndex)} />
            <button onClick={() => inputRef.current[imageIndex].click()}>
              <i className="fa fa-pencil-alt"></i>
            </button>
          </div>
        ))}
      </div>
    ))}
    <button onClick={openModal}>Create Scenario</button>
    <button onClick={generatePDF}>Generate PDF</button>
    </div>
  );
}

export default App;