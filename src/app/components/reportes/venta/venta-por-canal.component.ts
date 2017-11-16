import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { Router, ActivatedRoute } from '@angular/router';

import * as moment from 'moment';
declare var jQuery:any;

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import { ApiService } from '../../../services/api.service';
import { InitService } from '../../../services/init.service';

@Component({
  selector: 'app-venta-por-canal',
  templateUrl: './venta-por-canal.component.html',
  styles: []
})
export class VentaPorCanalComponent implements OnInit {

  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  showContents:boolean = false
  mainCredential:string = 'tablas_f'
  currentUser:any

  searchStart:any
  searchEnd:any
  soloVenta:boolean = true
  pdvType:boolean = false

  loadingData:boolean = false
  ventaData:any

  constructor(
                public _dateRangeOptions: DaterangepickerConfig,
                public _api:ApiService,
                private _init:InitService,
                public toastr: ToastsManager, vcr: ViewContainerRef,
                public route:Router,
                public activatedRoute:ActivatedRoute
                ){

    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
  }

  dateChange( start, end ){

    this.searchStart = start.format("YYYY-MM-DD")
    this.searchEnd = end.format("YYYY-MM-DD")

    jQuery('#datepicker').val(`${start.format("DD MMM 'YY")} - ${end.format("DD MMM 'YY")}`)

    // this.getCuartiles(this.searchStart, this.searchEnd, this.skill)
  }

  search(){
    this.ventaData = null
    this.loadingData = true

    let sv    = 1
    let type  = 1

    if(!this.soloVenta){
      sv = 0
    }
    if(!this.pdvType){
      type = 0
    }

    this._api.restfulGet( `${this.searchStart}/${this.searchEnd}/${sv}/${type}`, 'venta/getVentaPorCanalSV')
            .subscribe( res =>{
              this.ventaData = res.data
              this.loadingData = false
            }, err => {
              if(err){
                let error = err.json()
                this.toastr.error( error.msg, `Error ${err.status} - ${err.statusText}` )
                console.error(err.statusText, error.msg)
                this.loadingData = false
              }
            })
  }

  printDate( date, format ){
    let fecha = moment(date)

    moment.updateLocale('en', {
      weekdays : [ "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado" ]
    })

    return fecha.format( format )
  }

  printFormated( data ){
    return data.toFixed(2)
  }

  downloadXLS( id, title ){
    this.toXls( id, title )

  }

  toXls( sheets, title ){

    let wb = utils.table_to_book(document.getElementById(sheets), {raw: true});
    // console.log(wb)

    for(let index in wb.Sheets['Sheet1']){
      if( index.match( /^[C-K]([1-9][0-9]+|[2-9])$/ )){
        if( index.match( /^[C-G,J-K][0-9]+$/ ) ){
          wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v.substr(1,100).replace(/[,]/g,'')
        }else{
          wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v.replace('%','')
          wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v/100
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

  dwlTitle(){

    let sv
    let type

    if(this.soloVenta){
      sv = 'soloVenta'
    }else{
      sv = 'ventaYcxl'
    }

    if(this.pdvType){
      type = 'porCanalPDV'
    }else{
      type = 'porTipoPDV'
    }

    let title = `ventaPorCanal (${sv} - ${type}) - ${this.searchStart}a${this.searchEnd}`

    return title
  }

}
