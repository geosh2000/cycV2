import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';

import {ApplyCxcComponent} from '../formularios/apply-cxc.component';

import { Ng2SmartTableModule, LocalDataSource, ViewCell } from 'ng2-smart-table';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import * as moment from 'moment';
declare var jQuery:any;


import { ApiService } from '../../services/api.service';
import { InitService } from '../../services/init.service';

@Component({
  selector: 'app-cxc',
  templateUrl: './cxc.component.html',
  styles: []
})
export class CxcComponent implements OnInit {

  @ViewChild(ApplyCxcComponent) _applyCxc:ApplyCxcComponent

  showContents:boolean = false
  mainCredential:string = 'cxc_read'

  cxcPendientes:boolean = false
  listCortesFlag:boolean = false
  ready:boolean = false
  loadingCxc:boolean = false
  errorFlag:boolean = false
  actualCxcReady:boolean = false
  editFlag:boolean = false
  applyFlag:boolean = false
  submitting:boolean = false

  eventLog:any
  actualCxc:any

  formEditCxc:FormGroup

  currentUser:any
  listCortes:any
  listCxc:any
  errorMsg:any

  searchStart:any
  searchEnd:any

  smartTableSettings = {
    columns: {
      id: { title: 'id'},
      NombreAsesor: { title: 'NombreAsesor'},
      fecha_cxc: { title: 'Fecha CxC'},
      tipoOK: { title: 'Tipo'},
      monto: { title: 'Monto'},
      localizador: {
                      title:  'Localizador',
                      type:   'html',
                      valuePrepareFunction: function(cell, row){
                        let show = `<a href="https://rsv.pricetravel.com.mx/reservations/show/${ cell }" target='_blank'>${ cell }</a>`
                        return show
                      }
                    },
      fecha_aplicacion: { title: 'Fecha Aplicacion'},
      firmado: {
                      title:  'Firmado',
                      type:   'html',
                      valuePrepareFunction: function(cell, row){

                        let show

                        if( cell == 1){
                          show = `<span class="badge badge-success">Firmado</span>`
                        }else{
                          show = `<span class="badge badge-danger">No Firmado</span>`
                        }

                        return show
                      }
                    },
      comments: { title: 'Comentarios'},
      NombreCreador: { title: 'Creador'},
      date_created: { title: 'Fecha Creación'},
      last_update: { title: 'Ultima actualización'},
      NombreAplicador: { title: 'Actualizado Por'},
      status: {
                      title:  'Status',
                      type:   'html',
                      valuePrepareFunction: function(cell, row){

                        let show

                        switch( cell ){
                          case '0':
                            show = `<span class="badge badge-danger">Pendiente Envío</span>`
                            break;
                          case '1':
                            show = `<span class="badge badge-info">En Espera de RRHH</span>`
                            break;
                          case '2':
                            show = `<span class="badge badge-success">Aplicado</span>`
                            break;
                        }

                        return show
                      }
                    },
    },
    mode: 'external',
    actions: {
      add: false,
      edit: true,
      delete: false
    },
    pager: {
      perPage: 50
    }
  }

  public multiPicker = {
    showDropdowns: true,
    opens: "left"
  }

  constructor(
              private _api:ApiService,
              private _init:InitService
              ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.formEditCxc = new FormGroup({
      id: new FormControl('', [ Validators.required ] ),
      comments: new FormControl( '' ),
      firmado: new FormControl( '' ),
      applier: new FormControl('', [ Validators.required ] )
    })
  }

  dateChange( start, end ){

    this.searchStart = start.format("YYYY-MM-DD")
    this.searchEnd = end.format("YYYY-MM-DD")

    jQuery('#datepicker').val(`${this.searchStart} - ${this.searchEnd}`)

    this.getCxc(this.searchStart, this.searchEnd)
  }

  ngOnInit() {
  }

  getCxc( inicio, fin ){

    this.loadingCxc = true
    this.ready = false
    this.errorFlag = false

    this._api.restfulGet( '', `Cxc/getAllCxc/${inicio}/${fin}`)
            .subscribe( res => {

              this.loadingCxc = false
              this.ready = true

              if(res['status']){

                this.listCxc = res['data']

              }else{
                this.errorFlag = true
                this.errorMsg = res['error']
                console.error( res )
              }
            })
  }

  downloadXLS( id, title ){
    this.toXls( id, title )

  }

  toXls( sheets, title ){

    let wb = utils.table_to_book(document.getElementById(sheets), {raw: true});
    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  calendarEventsHandler(e:any) {
        console.log(e);
        this.eventLog += '\nEvent Fired: ' + e.event.type;
    }

    viewDetails( event ){
      this.actualCxc = event.data
      this.actualCxcReady = true
      this.editFlag = false
      this.applyFlag= false

      jQuery('#editCXC').modal('show')
    }

    editCxc(){
      this.formEditCxc.controls['id'].setValue(this.actualCxc['id'])
      this.formEditCxc.controls['applier'].setValue(this.currentUser.hcInfo['id'])
      this.formEditCxc.controls['comments'].setValue(this.actualCxc['comments'])

      if(this.actualCxc['firmado'] == 1){
        this.formEditCxc.controls['firmado'].setValue(true)
      }else{
        this.formEditCxc.controls['firmado'].setValue(false)
      }

      this.editFlag = true
    }

    noEdit(){
      this.formEditCxc.reset()
      this.editFlag = false
    }

    submit(){
      this.submitting = true
      this._api.restfulPut( this.formEditCxc.value, 'Cxc/edit' )
              .subscribe( res => {
                if(res['status']){
                  this.submitting = false
                  jQuery("#editCXC").modal('hide')
                  this.getCxc(this.searchStart, this.searchEnd)
                }else{
                  console.error( res )
                }
              })
    }

    changeStatus( status ){
      this.submitting = true

      let params = {
        id: this.actualCxc['id'],
        applier: this.currentUser.hcInfo['id']
      }

      this._api.restfulPut( params, 'Cxc/statusChange' )
              .subscribe( res => {
                if(res['status']){
                  this.submitting = false
                  jQuery("#editCXC").modal('hide')
                  this.getCxc(this.searchStart, this.searchEnd)
                }else{
                  console.error( res )
                }
              })
    }

    checkCredential( credential, test:boolean = false ){

      return this._init.checkCredential( credential, false, test )
    }



}