import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import DateTimePicker from 'react-datetime-picker';
import moment from 'moment';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { uiCloseModal } from '../../actions/ui';
import { eventClearActive, eventStartAddNew, startEventUpdate } from '../../actions/events';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};
if( process.env.NODE_ENV !== 'test'){
  Modal.setAppElement('#root');
}

// const now = moment().minutes(0).seconds(0).add(1, 'hours');
const now = moment().minutes(0).seconds(0).add(1, 'hours');
const nowPlus1Hour = now.clone().add(1, 'hours');

const initEvent = {
  title: '',
  notes: '',
  start: now.toDate(),
  end: nowPlus1Hour.toDate()
}


export const CalendarModal = () => {
  const dispatch = useDispatch();

  const {modalOpen} = useSelector(state => state.ui)
  const {activeEvent} = useSelector(state => state.calendar)

  const [dateStart, setDateStart] = useState(now.toDate());
  const [dateEnd, setDateEnd] = useState(nowPlus1Hour.toDate());
  const [titleValid, setTitleValid] = useState( true )
  
  const [formValues, setFormValues] = useState(initEvent);

  const { title, notes, start, end } = formValues;

  useEffect(() => {
    if(activeEvent){
      setFormValues( activeEvent )
    } else{
      setFormValues( initEvent)
    }
  }, [activeEvent, setFormValues])

  const handleInputChange = ({ target }) => {
    setFormValues({
      ...formValues,
      [target.name]: target.value
    });
  }

  const onCloseModal = () => {
    // todo: cerrar el modal
    dispatch( uiCloseModal() );
    // timeout para que no se bugee la animacion del close pero sin timeout en testing env
    if(process.env.NODE_ENV === 'test'){
      dispatch( eventClearActive() );
      setFormValues( initEvent );
    } else {
      setTimeout(() => {
        dispatch( eventClearActive() );
        setFormValues( initEvent );
      }, 150);
    }
  }

  const handleStartDateChange = (e) => {
    setDateStart(e);
    setFormValues({
      ...formValues,
      start: e
    });
  }

  const handleEndDateChange = (e) => {
    setDateEnd(e);
    setFormValues({
      ...formValues,
      end: e
    });
  }

  const handleSubmitForm = (e) => {
    e.preventDefault();
    
    const momentStart = moment(start)
    const momentEnd = moment(end)

    if( momentEnd.isSameOrBefore( momentStart ) ){
      return Swal.fire('Fecha inválida', 'La fecha de fin debe ser mayor a la fecha de inicio', 'error');
    }

    if( title.trim().length < 2 ){
      // alternativa a sweetalert
      return setTitleValid(false);
    }

    // todo: realizar grabacion
    if( activeEvent ){
      dispatch( startEventUpdate(formValues) );
    } else{
      dispatch( eventStartAddNew(formValues) );
    }

    setTitleValid(true);
    onCloseModal();
  }

  return (
    <Modal
      isOpen={modalOpen}
      onRequestClose={onCloseModal}
      style={customStyles}
      closeTimeoutMS={200}
      className="modal"
      overlayClassName="modal-fondo"
      ariaHideApp={ !process.env.NODE_ENV === 'test' }
    >
      <h1>{ (activeEvent) ? 'Editar evento' : 'Nuevo evento' }</h1>
      <hr />
      <form 
        className="container"
        onSubmit={handleSubmitForm}
      >

          <div className="form-group">
              <label>Fecha y hora inicio</label>
              <DateTimePicker
                onChange={handleStartDateChange}
                value={dateStart}
                className="form-control"
              />
          </div>

          <div className="form-group">
              <label>Fecha y hora fin</label>
              <DateTimePicker
                onChange={handleEndDateChange}
                value={dateEnd}
                minDate={dateStart}
                className="form-control"
              />
          </div>

          <hr />
          <div className="form-group">
              <label>Titulo y notas</label>
              <input 
                  type="text" 
                  className={`form-control ${!titleValid && 'is-invalid'}`}
                  placeholder="Título del evento"
                  name="title"
                  autoComplete="off"
                  value={title}
                  onChange={handleInputChange}
              />
              <small id="emailHelp" className="form-text text-muted">Una descripción corta</small>
          </div>

          <div className="form-group">
              <textarea 
                  type="text" 
                  className="form-control"
                  placeholder="Notas"
                  rows="5"
                  name="notes"
                  value={notes}
                  onChange={handleInputChange}
              ></textarea>
              <small id="emailHelp" className="form-text text-muted">Información adicional</small>
          </div>

          <button
              type="submit"
              className="btn btn-outline-primary btn-block"
          >
              <i className="far fa-save"></i>
              <span> Guardar</span>
          </button>

      </form>
    </Modal>
  )
}
