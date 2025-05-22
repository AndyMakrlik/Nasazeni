import React from 'react'
import { useEffect, useState } from 'react';
import CheckAuth from '../functions/checkAuthUnLogged';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function Add() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(true);
  const [inzerat, setInzerat] = useState({
    nazev: '',
    cena: '',
    stav: '',
    popis: ''
  });
  const [auto, setAuto] = useState({
    znacka: '',
    model: '',
    karoserie: '',
    pocetDveri: '',
    pocetSedadel: '',
  });
  const [specifikace, setSpecifikace] = useState({
    najeto: '',
    barva: '',
    rokVyroby: '',
    prevodovka: '',
    vykon: '',
    objem: '',
    palivo: '',
    pohon: '',
    vin: '',
  });
  const [droppedFiles, setDroppedFiles] = useState([]);

  useEffect(() => {
    CheckAuth(navigate).then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <></>;
  }
  

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));

    if (invalidFiles.length > 0) {
      toast.error(`Některé soubory nejsou obrázky: ${invalidFiles.map(f => f.name).join(', ')}`);
    }

    const newFiles = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file)
    }));

    setDroppedFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileInputChange = (event) => {
    const files = Array.from(event.target.files);

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));

    if (invalidFiles.length > 0) {
      toast.error(`Některé soubory nejsou obrázky: ${invalidFiles.map(f => f.name).join(', ')}`);
    }

    const newFiles = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file)
    }));

    setDroppedFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleDelete = (event, fileToDelete) => {
    event.preventDefault();
    setDroppedFiles((prevFiles) =>
      prevFiles.filter((file) => file.id !== fileToDelete.id)
    );
    // Clean up the preview URL
    URL.revokeObjectURL(fileToDelete.preview);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(droppedFiles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDroppedFiles(items);
  };

  // Helper function to trim whitespace and remove multiple spaces
  const cleanInput = (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\s+/g, ' ').trim();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Clean all text inputs before submission
    const formattedInzerat = {
      ...inzerat,
      nazev: cleanInput(inzerat.nazev),
      popis: cleanInput(inzerat.popis)
    };

    const formattedAuto = {
      ...auto,
      znacka: cleanInput(auto.znacka).toLowerCase(),
      model: cleanInput(auto.model).toLowerCase(),
      karoserie: cleanInput(auto.karoserie).toLowerCase(),
      pocetDveri: auto.pocetDveri.replace(/\s+/g, ''),
      pocetSedadel: auto.pocetSedadel.replace(/\s+/g, '')
    };

    const formattedSpecifikace = {
      ...specifikace,
      barva: cleanInput(specifikace.barva).toLowerCase(),
      najeto: specifikace.najeto.replace(/\s+/g, ''),
      rokVyroby: specifikace.rokVyroby.replace(/\s+/g, ''),
      vykon: specifikace.vykon.replace(/\s+/g, ''),
      objem: specifikace.objem.replace(/\s+/g, '')
    };

    if (!formattedInzerat.nazev) {
      toast.error('Název musí být vyplněný.');
    } else if (!formattedInzerat.cena || Number(formattedInzerat.cena) <= 0 || isNaN(Number(formattedInzerat.cena))) {
      toast.error('Cena musí být vyplněna a kladná.');
    } else if (!formattedInzerat.stav) {
      toast.error('Stav inzerátů musí být zvolen.');
    } else if (!formattedInzerat.popis) {
      toast.error('Popis musí být vyplněn.');
    } else if (!formattedAuto.znacka) {
      toast.error('Značka musí být vyplněna');
    } else if (!formattedAuto.model) {
      toast.error('Model musí být vyplněn.');
    } else if (!formattedAuto.karoserie) {
      toast.error('Karoserie musí být vyplněna.')
    } else if (!formattedAuto.pocetDveri || isNaN(Number(formattedAuto.pocetDveri))) {
      toast.error('Počet dveří musí být vyplněn a napsán číslicí.')
    } else if (!formattedAuto.pocetSedadel || isNaN(Number(formattedAuto.pocetSedadel))) {
      toast.error('Počet sedadel musí být vyplněn a napsán číslicí.')
    } else if (!formattedSpecifikace.najeto || isNaN(Number(formattedSpecifikace.najeto))) {
      toast.error('Nájeté kilometry musí být vyplněny a napsány pouze číslovkou.')
    } else if (!formattedSpecifikace.barva) {
      toast.error('Barva musí být vyplněna.')
    } else if (!formattedSpecifikace.rokVyroby || isNaN(Number(formattedSpecifikace.rokVyroby)) || formattedSpecifikace.rokVyroby > currentYear || formattedSpecifikace.rokVyroby < 1885) {
      toast.error(`Rok musí být vyplněn a napsán číslovkou a menší nebo roven ${currentYear}.`)
    } else if (!formattedSpecifikace.prevodovka) {
      toast.error('Převodovka musí být zvolena.')
    } else if (!formattedSpecifikace.vykon || isNaN(Number(formattedSpecifikace.vykon))) {
      toast.error('Výkon musí být vyplněn a napsán číslovkou.')
    } else if (!formattedSpecifikace.objem || isNaN(Number(formattedSpecifikace.objem))) {
      toast.error('Objem musí být vyplněn a napsán číslovkou.')
    } else if (!formattedSpecifikace.palivo) {
      toast.error('Palivo musí být zvoleno.')
    } else if (!formattedSpecifikace.pohon) {
      toast.error('Pohon musí být zvolen.')
    } else if (!droppedFiles){
      toast.error('Musíte nahrát nejméně 1 obrázek.')
    } 
    else {
      droppedFiles.forEach((fileObj, index) => {
        formData.append(`images`, fileObj.file);
      });

      formData.append('inzerat', JSON.stringify(formattedInzerat));
      formData.append('auto', JSON.stringify(formattedAuto));
      formData.append('specifikace', JSON.stringify(formattedSpecifikace));

      axios.post(`${process.env.REACT_APP_API_URL}/api/add`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(res => {
          if (res.data.Status === "Success") {
            toast.success("Úspěšné vložení inzerátu.");
            navigate('/');
          } else {
            toast.error(res.data.Error);
          }
        })
        .catch(error => console.log("Chyba při odesílání formuláře:", error));
    }
  };

  // Simplified input handlers without cleaning
  const handleInzeratChange = (field, value) => {
    setInzerat(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAutoChange = (field, value) => {
    setAuto(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecifikaceChange = (field, value) => {
    setSpecifikace(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to capitalize first letter only for display
  const displayValue = (value) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <>
      <div className='container '>
        <div>
          <form onSubmit={handleSubmit}>
            <div className='row' style={{ marginBottom: '50px' }}>
              <div className='text-center'>
                <h2>Inzerát</h2>
                <hr></hr>
              </div>
              <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12'>
                <label htmlFor='nazev' className='form-label'>Název</label>
                <input 
                  style={{ marginBottom: '20px' }} 
                  id='nazev' 
                  type='text' 
                  className='form-control' 
                  placeholder='Audi RS3 MATRIX'
                  defaultValue={inzerat.nazev}
                  onChange={e => setInzerat(prev => ({ ...prev, nazev: e.target.value }))}
                />
                <div className='row'>
                  <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-6'>
                    <label htmlFor='cena' className='form-label'>Cena</label>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                      <input 
                        id='cena' 
                        type='text' 
                        className='form-control' 
                        placeholder='1 999 000'
                        defaultValue={inzerat.cena}
                        onChange={e => setInzerat(prev => ({ ...prev, cena: e.target.value }))}
                      />
                      <span className="input-group-text" style={{ backgroundColor: 'white' }}>Kč</span>
                    </div>
                  </div>
                  <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-6'>
                    <label htmlFor='stav' className='form-label'>Stav</label>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                      <select id='stav' type='text' className='form-select' defaultValue={''}
                        onChange={e => setInzerat({ ...inzerat, stav: e.target.value })}>
                        <option value='' disabled>Vyberte stav</option>
                        <option value="Aktivni">Aktivní</option>
                        <option value="Rezervovany">Rezervovaný</option>
                        <option value="Zruseny">Zrušený</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12'>
                <label htmlFor='popis' className='form-label'>Popis</label>
                <textarea 
                  style={{ marginBottom: '20px', height: '128px' }} 
                  id='popis' 
                  type='text' 
                  className="form-control" 
                  placeholder='Zde napiště svůj popis vozu, závady, co chcete přidat k vozu, výbavu atd.'
                  defaultValue={inzerat.popis}
                  onChange={e => setInzerat(prev => ({ ...prev, popis: e.target.value }))}
                />
              </div>
            </div>
            <div className='row' style={{ marginBottom: '50px' }}>
              <div className='text-center'>
                <h2>Auto</h2>
                <hr></hr>
              </div>
              <h4>Výrobce</h4>
              <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12'>
                <label htmlFor='znacka' className='form-label'>Značka</label>
                <input 
                  style={{ marginBottom: '20px' }} 
                  id='znacka' 
                  type='text' 
                  className='form-control' 
                  placeholder='Audi'
                  defaultValue={auto.znacka}
                  onChange={e => setAuto(prev => ({ ...prev, znacka: e.target.value }))}
                />
              </div>
              <div className='col-12 col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12'>
                <label htmlFor='model' className='form-label'>Model</label>
                <input 
                  style={{ marginBottom: '20px' }} 
                  id='model' 
                  type='text' 
                  className='form-control' 
                  placeholder='RS3'
                  defaultValue={auto.model}
                  onChange={e => setAuto(prev => ({ ...prev, model: e.target.value }))}
                />
              </div>
            </div>
            <div className='row' style={{ marginBottom: '50px' }}>
              <h4>Typ Vozidla</h4>
              <div className='col-12 col-xxl-4 col-xl-4 col-lg-4 col-md-12 col-sm-12'>
                <label htmlFor='karoserie' className='form-label'>Karoserie</label>
                <input 
                  style={{ marginBottom: '20px' }} 
                  id='karoserie' 
                  type='text' 
                  className='form-control' 
                  placeholder='Sportovní hatchback'
                  defaultValue={auto.karoserie}
                  onChange={e => setAuto(prev => ({ ...prev, karoserie: e.target.value }))}
                />
              </div>
              <div className='col-12 col-xxl-4 col-xl-4 col-lg-4 col-md-12 col-sm-12'>
                <label htmlFor='pocetDveri' className='form-label'>Počet Dveří</label>
                <input 
                  style={{ marginBottom: '20px' }} 
                  id='pocetDveri' 
                  type='text' 
                  className='form-control' 
                  placeholder='3'
                  defaultValue={auto.pocetDveri}
                  onChange={e => setAuto(prev => ({ ...prev, pocetDveri: e.target.value }))}
                />
              </div>
              <div className='col-12 col-xxl-4 col-xl-4 col-lg-4 col-md-12 col-sm-12'>
                <label htmlFor='pocetSedadel' className='form-label'>Počet Sedadel</label>
                <input 
                  style={{ marginBottom: '20px' }} 
                  id='pocetSedadel' 
                  type='text' 
                  className='form-control' 
                  placeholder='5'
                  defaultValue={auto.pocetSedadel}
                  onChange={e => setAuto(prev => ({ ...prev, pocetSedadel: e.target.value }))}
                />
              </div>
            </div>
            <div className='row' style={{ marginBottom: '50px' }}>
              <h4>Specifikace</h4>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='najeto' className='form-label'>Najeto</label>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <input 
                    id='najeto' 
                    type='text' 
                    className='form-control' 
                    placeholder='125 000'
                    defaultValue={specifikace.najeto}
                    onChange={e => setSpecifikace(prev => ({ ...prev, najeto: e.target.value }))}
                  />
                  <span className="input-group-text" style={{ backgroundColor: 'white' }}>Km</span>
                </div>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='barva' className='form-label'>Barva</label>
                <input 
                  style={{ marginBottom: '20px' }} 
                  id='barva' 
                  type='text' 
                  className='form-control' 
                  placeholder='Černá'
                  defaultValue={specifikace.barva}
                  onChange={e => setSpecifikace(prev => ({ ...prev, barva: e.target.value }))}
                />
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='rokVyroby' className='form-label'>Rok Výroby</label>
                <input style={{ marginBottom: '20px' }} id='rokVyroby' type='text' className='form-control' placeholder='2022'
                  onChange={e => setSpecifikace({ ...specifikace, rokVyroby: e.target.value })}></input>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='prevodovka' className='form-label'>Převodovka</label>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <select id='prevodovka' type='text' className='form-select' defaultValue={''}
                    onChange={e => setSpecifikace({ ...specifikace, prevodovka: e.target.value })}>
                    <option value='' disabled>Vyberte Převodovku</option>
                    <option value="Automatická">Automatická</option>
                    <option value="Manuální">Manuální</option>
                    <option value="Polo-automatická">Polo-automatická</option>
                  </select>
                </div>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='vykon' className='form-label'>Výkon</label>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <input id='vykon' type='text' className='form-control' placeholder='125'
                    onChange={e => setSpecifikace({ ...specifikace, vykon: e.target.value })}></input>
                  <span className="input-group-text" style={{ backgroundColor: 'white' }}>kW</span>
                </div>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='objem' className='form-label'>Objem</label>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <input id='objem' type='text' className='form-control' placeholder='2 480'
                    onChange={e => setSpecifikace({ ...specifikace, objem: e.target.value })}></input>
                  <span className="input-group-text" style={{ backgroundColor: 'white' }}>ccm</span>
                </div>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='palivo' className='form-label'>Palivo</label>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <select id='palivo' type='text' className='form-select' defaultValue={''}
                    onChange={e => setSpecifikace({ ...specifikace, palivo: e.target.value })}>
                    <option value='' disabled>Vyberte Palivo</option>
                    <option value="Benzín">Benzín</option>
                    <option value="Nafta">Nafta</option>
                    <option value="Elektro">Elektro</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div className='col-12 col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12'>
                <label htmlFor='pohon' className='form-label'>Pohon</label>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <select id='pohon' type='text' className='form-select' defaultValue={''}
                    onChange={e => setSpecifikace({ ...specifikace, pohon: e.target.value })}>
                    <option value='' disabled>Vyberte Pohon</option>
                    <option value="Přední pohon">Přední pohon</option>
                    <option value="Zadní pohon">Zadní pohon</option>
                    <option value="Pohon všech kol">Pohon všech kol</option>
                  </select>
                </div>
              </div>
            </div>
            <div className='row' style={{ marginBottom: '50px' }}>
              <h4>VIN</h4>
              <div className='col-12'>
                <label htmlFor='vin' className='form-label'>Kód není povinný, je to ve vašem zájmu</label>
                <input id='vin' type='text' className='form-control' placeholder='TMBAEA200P0635724'
                  onChange={e => setSpecifikace({ ...specifikace, vin: e.target.value })}></input>
              </div>
            </div>
            <div className='row' style={{ marginBottom: '50px' }}>
              <div className='text-center'>
                <h2>Fotogalerie</h2>
                <hr></hr>
                <p className='text-muted'>První obrázek bude použit jako hlavní. Přetažením můžete změnit pořadí obrázků.</p>
              </div>
              <div className='col-12 text-center'>
                <div
                  className="drag-drop-area"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    border: '2px dashed #ccc',
                    padding: '20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <p>Přetáhněte sem obrázky.</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                    id="fileInput"
                  />
                  <label htmlFor="fileInput" style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                    Klikněte pro zobrazení průzkumníka
                  </label>
                  
                  {droppedFiles.length > 0 && (
                    <div className="mt-4">
                      <h5>Nahrané obrázky</h5>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="droppable" direction="horizontal">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '10px',
                                justifyContent: 'center',
                                padding: '10px'
                              }}
                            >
                              {droppedFiles.map((file, index) => (
                                <Draggable key={file.id} draggableId={file.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        position: 'relative',
                                        ...provided.draggableProps.style
                                      }}
                                    >
                                      <div style={{ 
                                        border: index === 0 ? '3px solid #28a745' : '1px solid #ddd',
                                        borderRadius: '5px',
                                        padding: '5px',
                                        backgroundColor: 'white'
                                      }}>
                                        <img
                                          src={file.preview}
                                          alt={`Preview ${index + 1}`}
                                          style={{
                                            width: '150px',
                                            height: '150px',
                                            objectFit: 'cover',
                                            display: 'block'
                                          }}
                                        />
                                        {index === 0 && (
                                          <div style={{
                                            position: 'absolute',
                                            top: '5px',
                                            left: '5px',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '3px',
                                            fontSize: '12px'
                                          }}>
                                            Hlavní
                                          </div>
                                        )}
                                        <button
                                          onClick={(e) => handleDelete(e, file)}
                                          style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            background: 'red',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            padding: 0
                                          }}
                                        >
                                          ×
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className='row justify-content-center'>
              <div className='mb-3 col-12 form-group'>
                <button type='submit' className='btn-border-radius-lg form-control btn btn-outline-secondary'>
                  Vložit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
