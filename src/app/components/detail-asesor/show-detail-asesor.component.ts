import { Directive, Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';

import { Subscription } from 'rxjs/Subscription'
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';

import { CredentialsService } from '../../services/credentials.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as Globals from '../../globals';
declare var jQuery:any;

import { ApiService } from '../../services/api.service';
import { InitService } from '../../services/init.service';
import { UploadImageComponent } from '../formularios/upload-image.component';



@Component({
  selector: 'app-show-detail-asesor',
  templateUrl: './show-detail-asesor.component.html',
  styles: []
})
export class ShowDetailAsesorComponent implements OnInit {

  uploadImage:string
  uploader:FileUploader = new FileUploader({url: this.uploadImage});

  @Output() showDialog = new EventEmitter<any>()
  @Output() showMsg = new EventEmitter<any>()
  @ViewChild(UploadImageComponent) _image:UploadImageComponent

  showContents:boolean = false
  mainCredential:string = "hc_detalle_asesores"
  currentUser:any

  actualAsesor:number
  asesor:any[];
  credentialStatus = 5;

  asesorImage = "assets/img/no-image.png"

  solicitarCambios:boolean = false;
  cxcRegistro:boolean = false;
  cxcApply:boolean = false;
  solicitudConfirmFlag:boolean = false;
  warning:number
  solicitudConfirmRetrieving:boolean = false;
  solicitudConfirmAlert:boolean = false;
  solicitudConfirmMsg:string = ""

  credentials

  modalName:string

  tokenSubscription: Subscription
  uploadURL:string = `${Globals.APISERV}/api/asesor-image-upload.php?id=`



  constructor( private _api:ApiService,
                private _init:InitService,
                private route:Router,
                private _credential:CredentialsService,
                private activatedRoute:ActivatedRoute
              ) {


    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )
    this.credentials = this.currentUser

    // console.log("Checking credentials...")

  }

  ngOnInit() {

  }

  getAsesorDetail( id:number ){

    this.actualAsesor = id

    let params={
      id: id
    }

    this._api.postFromApi( params, 'detalle' )
          .subscribe( respuesta =>{

            if(respuesta.idAsesor == null){
              this.showContents = false
            }

            console.log(respuesta)

            this.asesor = respuesta;


            if(this.asesor['numcol'] != null){
              this.asesorImage = `/img/asesores/${this.asesor['numcol']}.jpg`
            }else{
              this.asesorImage = "assets/img/no-image.png"
            }


            // console.log(respuesta)
          })
  }


  showModal( open, parent, name?:string, extraValue?, tipo? ){
    let type:string

    if(tipo == 1){
      type='set'
    }else{
      type ='ask'
    }
    this.showDialog.emit({open: open, parent: parent, name: name, extraValue: extraValue, tipo: type})
  }

  closeModal(){
    jQuery("#detailAsesor").modal('hide');
  }

  test ( something ){
    console.log(something)
  }

  cxlSol( step, id? ){

    if( step == 1 ){

      this.solicitudConfirmFlag = true
      this.solicitudConfirmMsg = "cancelar esta solicitud"
      this.warning = id

    }else{
      this.solicitudConfirmRetrieving = true
      this._api.restfulDelete( id, `SolicitudBC/cxl_solicitud` )
              .subscribe( res => {

                if(res['status']){
                    this.solicitudConfirmFlag = false
                    this.solicitudConfirmRetrieving = false
                    this.getAsesorDetail( this.actualAsesor )
                }else{
                  this.solicitudConfirmFlag = false
                  this.solicitudConfirmRetrieving = false
                  this.solicitudConfirmAlert = true
                  this.solicitudConfirmMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
                }

              })
    }


  }

  deleteSol( step, id? ){

    if( step == 1 ){

      this.solicitudConfirmFlag = true
      this.solicitudConfirmMsg = "borrar esta solicitud"
      this.warning = id

    }else{
      this.solicitudConfirmRetrieving = true
      this._api.restfulDelete( id, `SolicitudBC/delete_solicitud` )
              .subscribe( res => {

                if(res['status']){
                    this.solicitudConfirmFlag = false
                    this.solicitudConfirmRetrieving = false
                    this.getAsesorDetail( this.actualAsesor )
                }else{
                  this.solicitudConfirmFlag = false
                  this.solicitudConfirmRetrieving = false
                  this.solicitudConfirmAlert = true
                  this.solicitudConfirmMsg = `code: ${res['msg'].code} error: ${res['msg'].message}`
                }

              })
    }


  }

  solicitudConfirm( selection, tipo?, id? ){
    switch(selection){
      case 0:
        this.solicitudConfirmFlag = false
        break
      case 1:
        switch(tipo){
          case 'cxl':
            this.cxlSol( 2, id )
            break
          case 'del':
            this.deleteSol( 2, id )
            break
        }
        break;
    }
  }

  updateImg(event){
    let d = new Date()
    this.asesorImage=`${Globals.APISERV}/img/asesores/${this.asesor['numcol']}.jpg?${d.getTime()}`
  }

  upldCheck( event ){
    console.log( event )
    if( event.ERR ){
      this.showMsg.emit( {tipo: 'error', msg: event.msg } )
    }else{
      this.showMsg.emit( {tipo: 'success', msg: 'Imagen cargada' } )
      this.updateImg( 1 )
    }

  }

  uploadFoto(){
    if( !this.asesor['numcol'] ){
      let msg = 'No es posible asignar imagenes a asesores sin número de colaborador'
      console.error( msg )
      this.showMsg.emit( {tipo: 'error', msg: msg } )
    }else{
      this._image.build( `Foto para ${this.asesor['nombre']}`, 'asesores', this.asesor['numcol'])
    }
  }



}
