import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/Rx';
import { saveAs } from 'file-saver';
import { utils, write, WorkBook } from 'xlsx';
import * as Globals from '../../globals';

// -- * START Credentials Init Settings
import { Subscription } from 'rxjs/Subscription'
import { TokenCheckService } from '../../services/token-check.service';
import { CredentialsService } from '../../services/credentials.service';
declare var jQuery:any;
// -- * END Credentials Init Settings

import { ApiService } from '../../services/api.service';
import { ShowDetailAsesorComponent } from '../detail-asesor/show-detail-asesor.component';
import { CambioPuestoComponent } from '../formularios/cambio-puesto.component';
import { EditDetailsComponent } from '../formularios/edit-details.component';
import { SetBajaComponent } from '../formularios/set-baja.component';
import { AgregarCxcComponent } from '../formularios/agregar-cxc.component';
import { SaldarCxcComponent } from '../formularios/saldar-cxc.component';
import { ApplyCxcComponent } from '../formularios/apply-cxc.component';
import { SancionesComponent } from '../tables/sanciones.component';
import { AddVacanteComponent } from '../formularios/add-vacante.component';
import { DeactivateVacanteComponent } from '../formularios/deactivate-vacante.component';

@Component({
  selector: 'app-vacantes',
  templateUrl: './vacantes.component.html',
  styles: [ "li { cursor: pointer }"  ]
})
export class VacantesComponent implements OnInit {

  image:any = "/img/asesores/"

  // -- * START Credentials Init Settings
  tokenSubscription: Subscription
  showContents:boolean = false;
  protected neededCredential="hc_detalle_asesores"    //Credential needed for displaying content
  // -- * END Credentials Init Settings

  showPuestos:boolean = false
  showAlias:boolean = false

  viewAll:boolean = false
  viewFuture:boolean = false

  listFlag:boolean = false
  listData:any
  listHeaders:any

  showType:number = 1

  savedMopers:any

  loadingVacantes:boolean = false
  infoVacantes:any[]
  infoVacantesSliced:any[]
  baseRoute:string = "/vacantes"
  routeParams

  shownAsesor

  currentUserInfo

  titleBaja:string

  parentModal:string

  currentUser:any

  @ViewChild(ShowDetailAsesorComponent) detailAsesor:ShowDetailAsesorComponent
  @ViewChild(CambioPuestoComponent) cambioPuesto:CambioPuestoComponent
  @ViewChild(EditDetailsComponent) editDetails:EditDetailsComponent
  @ViewChild(SetBajaComponent) setBaja:SetBajaComponent
  @ViewChild(AgregarCxcComponent) addCxc:AgregarCxcComponent
  @ViewChild(SaldarCxcComponent) saldarCxc:SaldarCxcComponent
  @ViewChild(ApplyCxcComponent) applyCxc:ApplyCxcComponent
  @ViewChild(SancionesComponent) detalleSanciones:SancionesComponent
  @ViewChild(AddVacanteComponent) addVacante:AddVacanteComponent
  @ViewChild(DeactivateVacanteComponent) deactivateVacante:DeactivateVacanteComponent

  constructor(
                // -- * START Credentials Init Settings
                private _tokenCheck:TokenCheckService,
                private _credential:CredentialsService,
                // -- * END Credentials Init Settings
                private activatedRoute:ActivatedRoute,
                private route:Router,
                private _api:ApiService
              ) {


    // -- * START Credentials Init Settings
    let currentUser = JSON.parse(localStorage.getItem('currentUser')); //Check if currentUser Exists
    this.currentUser = currentUser
    if( currentUser != null){
      this.currentUserInfo=currentUser
      this.initCredentials()
    }

    this.tokenSubscription = this._tokenCheck.getTokenStatus()  //Observe Token Changes
        .subscribe( status => {
            if(status.status){
              this.initCredentials()
            }
            this.showContents = status.status
            if(status.status){
              this.getVacantes()
            }
        })
    // -- * END Credentials Init Settings

    this.activatedRoute.params.subscribe( params => {
      this.routeParams = params

      if(params['type'] == 2){
        this.listFlag = true
        this.showType = 2
      }else{
        this.listFlag = false
        this.showType = 1
      }

      if( this.infoVacantesSliced ){
        this.sliceInfo( this.infoVacantes )
      }
    });

    this.getVacantes()

  }

  ngOnInit() {
  }

  // -- * START Credentials Init Settings
  ngOnDestroy(){
    this.tokenSubscription.unsubscribe()
  }

  initCredentials(){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if( currentUser != null){

      //Check Main Credentials
      this._credential.checkCredentialServ( this.neededCredential, true )
        .subscribe( res => {
          if(res){
            this.showContents=this._credential.showContents
            }else{
            this.showContents=false;
          }
        })
    }else{
        jQuery("#loginModal").modal('show');
    }
  }
  // -- * END Credentials Init Settings

  getVacantes( type? ){

    this.loadingVacantes = true

    let tipo:number

    if(!type){
      tipo = this.routeParams['type']
    }else{
      tipo = type
    }

    if(tipo == 1){
      this.infoVacantes = null
      this.infoVacantesSliced = null
      let params={
        id: 1,
        area: this.currentUserInfo.hcInfo.hc_area,
        future: this.viewFuture
      }

      this._api.postFromApi( params, 'vacantes' )
        .subscribe( res => {
            if(res){
              this.loadingVacantes = false
              this.infoVacantes = res
              this.sliceInfo( res )
              // console.log( this.infoVacantesSliced )
            }
        })
    }else{
      this.listData = null
      this._api.restfulGet( '', `Headcount/downloadableList/${this.baseRoute}` )
                .subscribe( res => {

                  console.log(res)

                  this.loadingVacantes = false
                  if( res['status'] ){

                    this.listData = res['data']
                    this.listHeaders = res['headers']

                  }else{
                    console.error( res )
                  }

                })
    }


  }

  chgViewFuture(){
    this.viewFuture=!this.viewFuture
    this.getVacantes()
  }

  sliceInfo( info ){
    if(this.routeParams.alias){
      if(info.CodigoPuesto.Partes[this.routeParams.udn].Partes[this.routeParams.area].Partes[this.routeParams.dep].Partes[this.routeParams.puesto].Partes[this.routeParams.alias]){
          this.infoVacantesSliced = info.CodigoPuesto.Partes[this.routeParams.udn].Partes[this.routeParams.area].Partes[this.routeParams.dep].Partes[this.routeParams.puesto].Partes[this.routeParams.alias]
          this.showPuestos = false
          this.showAlias = true
          this.baseRoute = `/vacantes/${this.showType}/${ this.routeParams.udn }/${ this.routeParams.area }/${ this.routeParams.dep }/${ this.routeParams.puesto }/${ this.routeParams.alias }`
      }else{
        this.redirectVacantes()
      }
    }else if(this.routeParams.puesto){
      if(info.CodigoPuesto.Partes[this.routeParams.udn].Partes[this.routeParams.area].Partes[this.routeParams.dep].Partes[this.routeParams.puesto]){
          this.infoVacantesSliced = info.CodigoPuesto.Partes[this.routeParams.udn].Partes[this.routeParams.area].Partes[this.routeParams.dep].Partes[this.routeParams.puesto]
          this.showPuestos = true
          this.showAlias = false
          this.baseRoute = `/vacantes/${this.showType}/${ this.routeParams.udn }/${ this.routeParams.area }/${ this.routeParams.dep }/${ this.routeParams.puesto }`
      }else{
        this.redirectVacantes()
      }
    }else if(this.routeParams.dep){
      if(info.CodigoPuesto.Partes[this.routeParams.udn].Partes[this.routeParams.area].Partes[this.routeParams.dep]){
        this.infoVacantesSliced = info.CodigoPuesto.Partes[this.routeParams.udn].Partes[this.routeParams.area].Partes[this.routeParams.dep]
        this.showPuestos = false
        this.showAlias = false
        this.baseRoute = `/vacantes/${this.showType}/${ this.routeParams.udn }/${ this.routeParams.area }/${ this.routeParams.dep }`
      }else{
        this.redirectVacantes()
      }
    }else if(this.routeParams.area){
      if(info.CodigoPuesto.Partes[this.routeParams.udn].Partes[this.routeParams.area]){
        this.infoVacantesSliced = info.CodigoPuesto.Partes[this.routeParams.udn].Partes[this.routeParams.area]
        this.showPuestos = false
        this.showAlias = false
        this.baseRoute = `/vacantes/${this.showType}/${ this.routeParams.udn }/${ this.routeParams.area }`
      }else{
        this.redirectVacantes()
      }
    }else if(this.routeParams.udn){
      if(info.CodigoPuesto.Partes[this.routeParams.udn]){
        this.infoVacantesSliced = info.CodigoPuesto.Partes[this.routeParams.udn]
        this.showPuestos = false
        this.showAlias = false
        this.baseRoute = `/vacantes/${this.showType}/${ this.routeParams.udn }`

      }else{
        this.redirectVacantes()
      }
    }else{
      this.infoVacantesSliced = info.CodigoPuesto
      this.showPuestos = false
      this.showAlias = false
      this.baseRoute = `/vacantes/${this.showType}`
    }

    // console.log("BASE", this.baseRoute)
  }

  redirectVacantes(){
    this.route.navigateByUrl(`/vacantes/${this.showType}`);
  }

  aliasClass( status ){
    let clase:string
    switch(status){
      case 'Cubiertas':
        clase='card-outline-success'
        break
      case 'Vacantes':
        clase='card-outline-warning'
        break
      case 'Inactivas':
        clase='card-outline-danger'
        break
      default:
        clase='card-outline-info'
        break
    }

    return clase
  }


  showAsesorDetail( id ){
    this.route.navigateByUrl(`/detail-asesor/${ id }/1`);
  }

  showAddVacante( ){
    jQuery("#form_addVacante").modal('show');
    this.addVacante.buildForm()
  }

  showDeactivateVacante( id ){
    jQuery("#form_DeactivateVacante").modal('show');
    this.deactivateVacante.buildForm( id, this.currentUser.hcInfo['id'] )
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
        case 'addVacante':
          this.addVacante.buildForm()
          break

      }
    }

    this.parentModal=array
  }

  showDialogReturnParent( actualDialog ){
    jQuery(actualDialog).modal('hide')
    jQuery(this.parentModal['parent']).modal('show')
  }

  retrieveAgain( event ){
    this.showDialogReturnParent( event['form'] )
    this.detailAsesor.getAsesorDetail(this.shownAsesor)
  }

  setViewAll(){
    this.viewAll = true
  }

  sampleData = [
    {saludo: 'hola', de: 'como', enano: 'estas'},
    {saludo: 'espero', de: 'no', enano: 'del'},
    {saludo: 'todo', de:'mal',enano: '.'}
  ]

  downloadCSV( title ){
    this._api.restfulGet( '', `Headcount/downloadableList/${this.baseRoute}` )
              .subscribe( res => {

                if( res['status'] ){

                  this.toXls( {Headcount: res['data']}, 'Headcount' )

                }else{
                  console.error( res )
                }

              })
  }

  toXls( sheets, title ){

    let wb: WorkBook = { SheetNames: [], Sheets: {} };

    for(let title in sheets){
      wb.SheetNames.push(title);
      wb.Sheets[title] = utils.json_to_sheet(sheets[title], {cellDates: true});
    }

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

  showMopers( event ){
    jQuery(event['form']).modal('hide')
    this.savedMopers = event['mopers']
    this.getVacantes()
    jQuery('#moperOK').modal('show')
  }

  retrieveAgainVac( event ){
    jQuery(event['form']).modal('hide')
    this.getVacantes()
  }

  showList(){

    this.listFlag = !this.listFlag
    if(this.listFlag){
      this.showType = 2
      this.getVacantes( 2 )
    }else{
      this.showType = 1
      this.getVacantes()
    }

  }

  updateImg(event, index){
    this.image = `${Globals.APISERV}/img/asesores/`
  }

}
