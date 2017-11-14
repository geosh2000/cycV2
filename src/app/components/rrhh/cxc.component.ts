import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import {ApplyCxcComponent} from '../formularios/apply-cxc.component';
import {TableTemplateComponent} from '../../addon/table-template/table-template.component';

import { Ng2SmartTableModule, LocalDataSource, ViewCell } from 'ng2-smart-table';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import * as Globals from '../../globals';
import * as moment from 'moment';
declare var jQuery:any;

import { CompleterService, CompleterData } from 'ng2-completer';

import { AgregarCxcComponent } from '../formularios/agregar-cxc.component';
import { UploadImageComponent } from '../formularios/upload-image.component';

import { ApiService } from '../../services/api.service';
import { InitService } from '../../services/init.service';


@Component({
  selector: 'app-cxc',
  templateUrl: './cxc.component.html',
  styles: []
})
export class CxcComponent implements OnInit {

  @ViewChild( ApplyCxcComponent ) _applyCxc:ApplyCxcComponent
  @ViewChild( AgregarCxcComponent ) addCxc:AgregarCxcComponent
  @ViewChild( UploadImageComponent ) _image:UploadImageComponent
  @ViewChild( TableTemplateComponent ) _table:TableTemplateComponent

  showContents:boolean = false
  mainCredential:string = 'cxc_read'

  windowInHeight:any

  nameAsesor:string
  addedMsg:string
  showMsg:boolean = false

  filter:number

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
  documentImage:any
  imageTitle:any
  deleting:boolean = false

  formEditCxc:FormGroup

  currentUser:any
  listCortes:any
  listCxc:any
  errorMsg:any

  searchStart:any = moment()
  searchEnd:any

  public multiPicker = {
    showDropdowns: true,
    opens: "left"
  }

  // Autocomplete
   searchStrName:string;
   asesorSelected:string;
   dataServiceName:CompleterData;

   confTable:any

   rulesTable:any = {
     firmado: {
                1:        {cell: 'Firmado',    style: 'badge badge-success',  faClass: ''},
                0:        {cell: 'No Firmado', style: 'badge badge-danger',   faClass: ''},
                default:  {cell: 'Otro',       style: 'badge badge-secondary',faClass: ''}
              },
     status:  {
                0:        {cell: 'En Revisión',       style: 'badge badge-danger',  faClass: ''},
                1:        {cell: 'En espera de RRHH', style: 'badge badge-info',    faClass: ''},
                2:        {cell: 'Aplicado',          style: 'badge badge-success', faClass: ''},
                default:  {cell: 'Otro',              style: 'badge badge-secondary', faClass: ''}
              },
     fileExist:  {
                0:        {cell: 'Cargar',            style: 'btn btn-sm btn-warning',  faClass: 'fa fa-fw fa-upload'},
                1:        {cell: 'Ver',               style: 'btn btn-sm btn-info',     faClass: 'fa fa-fw fa-eye'},
                default:  {cell: 'Otro',              style: 'btn btn-sm btn-warning',  faClass: 'fa fa-fw fa-times'}
              }
   }


  constructor(
              private _api:ApiService,
              private _init:InitService,
              public toastr: ToastsManager,
              private completerService:CompleterService
              ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.confTable = {
      id:                { title: 'ID',            style: 'btn btn-sm btn-primary', cell: '', faShow: true,  faOnly: false, faClass: 'fa fa-fw fa-pencil', show: true,  type: 'button',
                            click: (row, cell)=>{
                              this.viewDetails( row )
                            }},
      asesor:            { title: 'Asesor',        style: '',          cell: '', faShow: false, faOnly: false, faClass: '', show: false, type: 'span' },
      NombreAsesor:      { title: 'NombreAsesor',  style: 'text-left', cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'span' },
      fecha_cxc:         { title: 'Fecha CxC',     style: '',          cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'span' },
      tipoOK:            { title: 'Tipo',          style: '',          cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'span' },
      monto:             { title: 'Monto',         style: '',   cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'span',
                            custom( val ){
                              let result:any = +val
                              result = result.toLocaleString()
                              return `$${result}`
                            }
                          },
      localizador:       { title: 'Localizador',   style: '',          cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'a', link: "https://rsv.pricetravel.com.mx/reservations/show/" },
      fecha_aplicacion:  { title: 'Fecha Aplicacion', style: '',       cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'span' },
      fileExist:         { title: 'Documento',     style: '',          cell: '', faShow: true,  faOnly: false, faClass: '', show: true,  type: 'button',
                           click: ( row, cell )=>{
                               if(cell == 0){
                                 this._image.build(`Subir Documento de CXC: ${row['id']}`, 'cxc', row['id'])
                               }else{
                                 let d = new Date()
                                 this.documentImage=`${Globals.APISERV}/img/cxc/${row['id']}.jpg?${d.getTime()}`
                                 this.imageTitle = row['id']
                                 jQuery('#showDocument').modal('show')
                               }
                             }},
      firmado:           { title: 'Doc Firmado',   style: '',          cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'span' },
      comments:          { title: 'Comentarios',   style: '',          cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'span' },
      NombreCreador:     { title: 'Creador',       style: '',          cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'span' },
      date_created:      { title: 'Fecha Creación',style: '',          cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'span' },
      last_update:       { title: 'Ultima actualización',style: '',    cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'span' },
      NombreAplicador:   { title: 'Actualizado Por',style: '',         cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'span' },
      status:            { title: 'Status',        style: '',          cell: '', faShow: false, faOnly: false, faClass: '', show: true,  type: 'span' }
    }

    let now = moment()
    this.searchEnd = now.format("YYYY-MM-DD")

    if(this.currentUser != null){
      this.dataServiceName = this.completerService.remote(`${ Globals.APISERV }/ng2/json/listAsesores.json.php?tipo=name&token=${this.currentUser.token}&usn=${this.currentUser.username}&udn=${ this.currentUser.hcInfo['hc_udn']}&puesto=${ this.currentUser.hcInfo['hc_puesto_clave'] }&area=${ this.currentUser.hcInfo['hc_area'] }&dep=${ this.currentUser.hcInfo['hc_dep'] }&viewAll=${ this.currentUser.credentials['view_all_agents'] }&term=`, 'name,user,ncorto', 'name')
    }

    this.windowInHeight = (Math.floor(window.innerHeight*0.8)) + 'px'


    this.formEditCxc = new FormGroup({
      id: new FormControl('', [ Validators.required ] ),
      monto: new FormControl('', [ Validators.required, Validators.pattern("^[1-9]{1}[0-9]*([.]{0,1}[0-9]{1,2}$|$)") ] ),
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
                this._table.build( this.confTable, this.listCxc, this.rulesTable )

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
    // console.log(wb)

    for(let index in wb.Sheets['Sheet1']){
      if( index.match( /^[A,E,F]([1-9][0-9]+|[2-9])$/ )){
        if( index.match( /^[A][0-9]+$/ ) ){
          wb.Sheets['Sheet1'][index].v = wb.Sheets['Sheet1'][index].v.substr(1,100)
        }else if( index.match( /^[E][0-9]+$/ ) ){
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

  calendarEventsHandler(e:any) {
        console.log(e);
        this.eventLog += '\nEvent Fired: ' + e.event.type;
    }

    viewDetails( cxc ){
      this.actualCxc = cxc
      this.actualCxcReady = true
      this.editFlag = false
      this.applyFlag= false

      jQuery('#editCXC').modal('show')
    }

    editCxc( cxc ){
      this.formEditCxc.controls['id'].setValue(this.actualCxc['id'])
      this.formEditCxc.controls['monto'].setValue(this.actualCxc['monto'])
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

      console.log( params )

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

    onSelected( event ){

      this.nameAsesor = event.title

      jQuery("#form_addCxc").modal('show')

      this.addCxc.buildForm( { idAsesor: event.originalObject.id } )
    }

    addedCXC(event){
      jQuery("#form_addCxc").modal('hide')
      this.showMsg = true;
      this.addedMsg = "CXC cargado correctamente"
      this.searchStart = event.date;
      this.searchEnd = event.date;
      this.getCxc(this.searchStart, this.searchEnd)
      setTimeout(()=>{
        this.showMsg = false
      },5000)

    }

    testToastr(){
      console.log("print toast")
      this.toastr.success("CXC guardado correctamente", 'Aprobada!');
    }

    checkImageExists( dir, name ){
      let imgStatus = this._image.imageExists( dir, name, 'jpg')

      return !imgStatus['ERR']
    }

    showFormat( id ){
      console.log( id )
    }

    upldCheck( event ){
      if(event.ERR){
        this.toastr.error( event.msg, 'Error!')
      }else{
        this.toastr.success( event.msg, 'Success!')
        this.getCxc(this.searchStart, this.searchEnd)
      }
    }

    deleteImage(){
      this.deleting = true

      this._api.restfulDelete( `cxc/${this.imageTitle}/jpg`, 'UploadImage/imageDel' )
              .subscribe( res => {
                if(res.ERR){
                  this.toastr.error( res.msg, 'Error!')
                }else{
                  this.toastr.success( res.msg, 'Borrado')
                  jQuery('#showDocument').modal('hide')
                  this.getCxc(this.searchStart, this.searchEnd)
                }
                this.deleting = false
              })
    }

    updateImg(event){
      let d = new Date()
      if(this.imageTitle != null){
        this.documentImage=`${Globals.APISERV}/img/asesores/${this.imageTitle}.jpg?${d.getTime()}`
      }
    }


}
