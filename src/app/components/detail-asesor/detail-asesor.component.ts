import { Component, OnInit, OnDestroy, ViewChild, Input, Output, ViewContainerRef, EventEmitter } from '@angular/core';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { Subscription } from 'rxjs/Subscription'
import { AsesoresService } from '../../services/asesores.service';

import { ApiService } from '../../services/api.service';
import { InitService } from '../../services/init.service';

import { CredentialsService } from '../../services/credentials.service';
import { TokenCheckService } from '../../services/token-check.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CompleterService, CompleterData } from 'ng2-completer';
import * as Globals from '../../globals';
declare var jQuery:any;

import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';

import { Ng2SmartTableModule, LocalDataSource, ViewCell } from 'ng2-smart-table';

import { ShowDetailAsesorComponent } from './show-detail-asesor.component';
import { CambioPuestoComponent } from '../formularios/cambio-puesto.component';
import { ReingresoAsesorComponent } from '../formularios/reingreso-asesor.component';
import { EditDetailsComponent } from '../formularios/edit-details.component';
import { SetBajaComponent } from '../formularios/set-baja.component';
import { AgregarCxcComponent } from '../formularios/agregar-cxc.component';
import { SaldarCxcComponent } from '../formularios/saldar-cxc.component';
import { ApplyCxcComponent } from '../formularios/apply-cxc.component';
import { AddAsesorComponent } from '../formularios/add-asesor.component';
import { EditarAjusteSalarialComponent } from '../formularios/editar-ajuste-salarial.component';
import { AjusteSalarialComponent } from '../formularios/ajuste-salarial.component';
import { AddContratoComponent } from '../formularios/add-contrato.component';
import { SancionesComponent } from '../tables/sanciones.component';

@Component({
  selector: 'app-detail-asesor',
  templateUrl: './detail-asesor.component.html',
  styles: []
})
export class DetailAsesorComponent implements OnInit {

  @ViewChild(ShowDetailAsesorComponent) detailAsesor:ShowDetailAsesorComponent
  @ViewChild(CambioPuestoComponent) cambioPuesto:CambioPuestoComponent
  @ViewChild(ReingresoAsesorComponent) _reingreso:ReingresoAsesorComponent
  @ViewChild(EditDetailsComponent) editDetails:EditDetailsComponent
  @ViewChild(SetBajaComponent) setBaja:SetBajaComponent
  @ViewChild(AgregarCxcComponent) addCxc:AgregarCxcComponent
  @ViewChild(SaldarCxcComponent) saldarCxc:SaldarCxcComponent
  @ViewChild(ApplyCxcComponent) applyCxc:ApplyCxcComponent
  @ViewChild(SancionesComponent) detalleSanciones:SancionesComponent
  @ViewChild(AddAsesorComponent) addAsesor:AddAsesorComponent
  @ViewChild(AjusteSalarialComponent) ajusteSalarial:AjusteSalarialComponent
  @ViewChild(EditarAjusteSalarialComponent) editarAjusteSalarial:EditarAjusteSalarialComponent
  @ViewChild(AddContratoComponent) addContrato:AddContratoComponent

  asesor:any[];
  showContents:boolean = false;
  credentialStatus = 5;
  mainCredential="hc_detalle_asesores"

  currentUser:any

  solicitarCambios:boolean = false;
  showFilters:boolean = true;
  cxcRegistro:boolean = false;
  cxcApply:boolean = false;

  tokenSubscription: Subscription

  detailLoading:boolean = false
  parentModal

  listAsesores:any

  titleBaja:string
  titleSelection:string
  listFlag:boolean = false
  params

  gridOptions:Object = {}

  // Autocomplete
  protected searchStrName:string;
  protected searchStrDep:string;
  protected searchStrIngreso:string;
  protected searchStrEgreso:string;
  protected asesorSelected:string;
  protected dataServiceName:CompleterData;
  protected dataServiceDep:CompleterData;
  protected dataServiceIngreso:CompleterData;
  protected dataServiceEgreso:CompleterData;

  protected onSelected(item){
    if(item){
      if(item.originalObject.Codigo){
        this.listFlag = true
        this.titleSelection = item.originalObject.Codig
        this.getListAsesores( item.originalObject.id )
        this.route.navigateByUrl(`/detail-asesor/${item.originalObject.id}/2`);
      }else{
        this.listFlag = false
        this.titleSelection = item.originalObject.name
        this.asesorSelected = `${item.title} (${item.originalObject.id})`;

        this.redirectAsesor(item.originalObject.id);
        // this.detailAsesor.showContents = false
      }

    }else{
      this.asesorSelected = "";
    }

  }

  smartTableSettings = {
    columns: {
      id: {
        title: 'id',
        editable: false
      },
      foto:{
        title: 'Foto',
        type: 'html',
        valuePrepareFunction: (cell, row) => {
          let result = `<img alt='image' class='img rounded img-fluid' style='margin: auto;' src='${Globals.APISERV}/img/asesores/${cell}.jpg'>`
          return result
        }
      },
      num_colaborador: {
        title: '#'
      },
      Nombre: {
        title: 'Nombre'
      },
      Jefe_Directo: {
        title: 'Jefe Directo'
      },
      Ingreso: {
        title: 'Ingreso'
      },
      Egreso: {
        title: 'Egreso'
      },
      Status: {
        title: 'Status'
      },
      Correo: {
        title: 'Correo'
      },
      Puesto: {
        title: 'Puesto'
      },
      Alias_Puesto: {
        title: 'Alias Puesto'
      },
      Oficina: {
        title: 'Oficina'
      },
      Ciudad: {
        title: 'Ciudad'
      },
      Fecha_Nacimiento: {
        title: 'Fecha Nacimiento'
      },
      RFC: {
        title: 'RFC'
      },
      Telefono1: {
        title: 'Telefono1'
      },
      Telefono2: {
        title: 'Telefono2'
      },
      correo_personal: {
        title: 'Correo Personal'
      },
      Vigencia_Pasaporte: {
        title: 'Vigencia Pasaporte'
      },
      Vigencia_Visa: {
        title: 'Vigencia Visa'
      },
    },
    mode: 'external',
    actions: {
      add: false,
      edit: true,
      delete: false
    },
    pager: {
      display: false
    }
  }

  smartTableSettingsOK = {
    columns: {
      id: {
        title: 'ID'
      },
      name: {
        title: 'Full Name'
      },
      username: {
        title: 'User Name'
      },
      email: {
        title: 'Email'
      }
    }
  }


  constructor( private _asesoresService:AsesoresService,
                private _tokenCheck:TokenCheckService,
                private _api:ApiService,
                private _init:InitService,
                private route:Router,
                private completerService:CompleterService,
                private _credential:CredentialsService,
                public toastr: ToastsManager, vcr: ViewContainerRef,
                private activatedRoute:ActivatedRoute
              ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this.toastr.setRootViewContainerRef(vcr);

    if(this.currentUser != null){
      let currentUser = this.currentUser
      this.dataServiceName = this.completerService.remote(`${ Globals.APISERV }/ng2/json/listAsesores.json.php?tipo=name&token=${currentUser.token}&usn=${currentUser.username}&udn=${ currentUser.hcInfo['hc_udn']}&puesto=${ currentUser.hcInfo['hc_puesto_clave'] }&area=${ currentUser.hcInfo['hc_area'] }&dep=${ currentUser.hcInfo['hc_dep'] }&viewAll=${ currentUser.credentials['view_all_agents'] }&term=`, 'name,user,ncorto', 'name')
      this.dataServiceDep = this.completerService.remote(`${ Globals.APISERV }/ng2/json/listAsesores.json.php?tipo=dep&token=${currentUser.token}&usn=${currentUser.username}&udn=${ currentUser.hcInfo['hc_udn']}&puesto=${ currentUser.hcInfo['hc_puesto_clave'] }&area=${ currentUser.hcInfo['hc_area'] }&dep=${ currentUser.hcInfo['hc_dep'] }&viewAll=${ currentUser.credentials['view_all_agents'] }&term=`, 'Codigo, id', 'Codigo')
      this.dataServiceIngreso = this.completerService.remote(`${ Globals.APISERV }/ng2/json/listAsesores.json.php?tipo=ingreso&token=${currentUser.token}&usn=${currentUser.username}&udn=${ currentUser.hcInfo['hc_udn']}&puesto=${ currentUser.hcInfo['hc_puesto_clave'] }&area=${ currentUser.hcInfo['hc_area'] }&dep=${ currentUser.hcInfo['hc_dep'] }&viewAll=${ currentUser.credentials['view_all_agents'] }&term=`, 'ingreso', 'fingreso')
      this.dataServiceEgreso = this.completerService.remote(`${ Globals.APISERV }/ng2/json/listAsesores.json.php?tipo=egreso&token=${currentUser.token}&usn=${currentUser.username}&udn=${ currentUser.hcInfo['hc_udn']}&puesto=${ currentUser.hcInfo['hc_puesto_clave'] }&area=${ currentUser.hcInfo['hc_area'] }&dep=${ currentUser.hcInfo['hc_dep'] }&viewAll=${ currentUser.credentials['view_all_agents'] }&term=`, 'egreso', 'fegreso')
    }

    this.activatedRoute.params.subscribe( params => {
      if( params.id ){
        // console.log(this.getAsesorDetail)
        this.detailLoading = true
        setTimeout( () => {
          this.params = params
          this.detailLoading = false

          if(params.tipo == 2){
            this.listFlag = true
            this.detailAsesor.showContents=false

            this.getListAsesores(params.id)
          }else{
            this.listFlag = false
            this.detailAsesor.showContents=true
            this.getAsesorDetail(params.id)
          }

        }, 1000)
      }
    });

  }

  ngOnInit() {

  }

  getAsesorDetail( id:number ){

    this.detailAsesor.getAsesorDetail( id )
  }

  redirectAsesor( id ){
    this.route.navigateByUrl(`/detail-asesor/${id}/1`);
  }



  getListAsesores( id ){
    this._api.restfulGet( id, 'Asesores/listAsesores' )
              .subscribe( res => {
                if(res['status']){
                  this.listAsesores = res['data']

                  console.log( res )
                }else{
                  console.error( res )
                }
              })
  }

  showAsesorChildDialog( array ){
    jQuery(array.open).modal('show')
    jQuery(array.parent).modal('hide')

    if(array.name){
      switch(array.name){
        case 'editDetails':
          this.editDetails.buildForm(array.extraValue)
          break
        case 'setBaja':
          this.setBaja.tipo = 'set'
          this.setBaja.titleSubmit = 'Guardar'
          this.setBaja.buildForm(array.extraValue)
          this.titleBaja = array.extraValue['corto']
          break
        case 'askBaja':
          this.setBaja.tipo = 'ask'
          this.setBaja.titleSubmit = 'Solicitar'
          this.setBaja.buildForm(array.extraValue)
          this.titleBaja = array.extraValue['corto']
          break
        case 'askCambio':
          this.cambioPuesto.buildForm(array.extraValue, array.tipo)
          break
        case 'reingreso':
          this._reingreso.buildForm( array.extraValue )
          break
        case 'addCxc':
          this.addCxc.buildForm(array.extraValue)
          break
        case 'saldarCxc':
          this.saldarCxc.buildForm(array.extraValue)
          break
        case 'applyCxc':
          this.applyCxc.buildForm(array.extraValue)
          break
        case 'detalleSanciones':
          this.detalleSanciones.buildForm(array.extraValue)
          break
        case 'ajusteSalarial':
          this.ajusteSalarial.buildForm(array.extraValue)
          break
        case 'editarAjusteSalarial':
          this.editarAjusteSalarial.buildForm(array.extraValue)
          break
        case 'addContrato':
          this.addContrato.buildForm( array.extraValue )
          break
      }
    }

    this.parentModal=array
  }

  retrieveAgain( event ){
    jQuery(event['form']).modal('hide')
    if(event['status'] || event['success']){
      this.getAsesorDetail(this.params.id)
    }

  }

  showDialogReturnParent( actualDialog ){
    jQuery(actualDialog).modal('hide')
  }

  downloadXLS( id, title ){
    this._api.restfulGet( id, 'Asesores/listAsesores' )
              .subscribe( res => {

                if( res['status'] ){

                  this.toXls( {Headcount: res['data']['data']}, title )

                }else{
                  console.error( res )
                }

              })
  }

  toXls( sheets, title ){

    let wb = utils.table_to_book(document.getElementById('listAsesores'), {raw: true});
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

  viewDetails( event ){
    this.route.navigateByUrl(`/detail-asesor/${ event.data.id }/1`);
  }

  showAddAsesor( ){
    jQuery("#form_addAsesor").modal('show');
    this.addAsesor.buildForm()
  }

  showConfirmationAdd( event ){
    if(event){
      jQuery('#form_addAsesor').modal('hide')
      this.toastr.success("Asesor agregado correctamente", 'Guardado!');
    }
  }

  toastrMsg( event ){
    switch( event.tipo ){
      case 'error':
        this.toastr.error( event.msg, 'Error!')
        break
      case 'success':
        this.toastr.success( event.msg, 'Success!')
        break
    }
  }

}
