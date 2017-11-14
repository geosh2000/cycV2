import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { Router, ActivatedRoute } from '@angular/router';

import * as moment from 'moment';
declare var jQuery:any;
declare var Noty:any;

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';

import { CorteComponent } from './corte.component';
import { UploadImageComponent } from '../../formularios/upload-image.component';

@Component({
  selector: 'app-components',
  templateUrl: './cxc-admin.component.html',
  styles: []
})
export class CxcAdminComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent
  @ViewChild( CorteComponent ) private _corte: CorteComponent
  @ViewChild( UploadImageComponent ) private _upImg: UploadImageComponent

  showContents:boolean = false
  mainCredential:string = 'default'
  currentUser:any

  listCortes:any
  listCortesFlag:boolean = false

  constructor(
                public _dateRangeOptions: DaterangepickerConfig,
                public _api:ApiService,
                private _init:InitService,
                public toastr: ToastsManager, vcr: ViewContainerRef,
                public route:Router,
                public activatedRoute:ActivatedRoute
                ){

    this.toastr.setRootViewContainerRef(vcr);

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this._dateRangeOptions.settings = {
      autoUpdateInput: false,
      locale: { format: "YYYY-MM-DD" }
    }

  }

  ngOnInit() {
    this.getCortes()
  }

  getCortes(){
    this._api.restfulGet( '', 'Nomina/listCortes' )
            .subscribe( res => {
              if(res['status']){
                this.listCortes = res['data']
                this.listCortesFlag = true
              }else{
                console.error( res )
              }
            })
  }

  selectedCorte( event ){
    this._corte.build( event.target.value )
  }

  showMsg( event ){
    this.toastr.error(`${ event.msg }`, `${ event.title.toUpperCase() }!`);
    console.log("Toaster", event)
  }

  showMsgSuc( event ){
    this.toastr.success(`${ event }`, `Guardado!`);
    this._corte.build( this._corte.corte )
  }

  showUploadModal( title, dir, fileName ){
    this._upImg.build( title, dir, fileName )
    jQuery('#formUploadImageComponent').modal('show')
  }

  downloadXLS( id, title ){
    this.toXls( id, title )

  }

  toXls( sheets, title ){

    let wb = utils.table_to_book(document.getElementById(sheets), {raw: true});
    // console.log(wb)

    for(let index in wb.Sheets['Sheet1']){
      if( index.match( /^[B-D,F-L]([1-9][0-9]+|[2-9])$/ )){
        if( index.match( /^[A][0-9]+$/ ) ){
          wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v.substr(1,100)
        }else if( index.match( /^[I-L][0-9]+$/ ) ){
          wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v.substr(1,100).replace(',','')
        }else{
          wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v.substr(0,100)
        }
        wb.Sheets['Sheet1'][index].t = 'n'
      }
    }


    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    // console.log(wb)

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), `${title}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  changeStatusButton( row, col, status ){
    let funcName:string

    this._api.restfulPut( { col: col, status: status }, 'Cxc/chgStatus' )
            .subscribe( res => {
              if(res.ERR){
                this.toastr.error( res.msg, 'Error!' )
              }else{
                this.getCortes()
              }
            })
  }

  statusChg( event ){

    this.loadingBuilder( event.type, true, event.id )

    this._api.restfulPut( { ids: event.id, status: event.status }, 'Cxc/chgStatus' )
            .subscribe( res => {
                this._corte.build( this._corte.corte )
                this.loadingBuilder( event.type, false, event.id )

            }, err => {
              if(err){
                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                this.loadingBuilder( event.type, false, event.id )
              }
            })
  }

  loadingBuilder( type, step, id? ){

    switch ( type ){
      case 'single':
        this._corte.chgLoading[ id ] = step
        break
      case 'multi':
        this._corte.chgLoading[ 0 ] = step
        break
    }
  }


}
