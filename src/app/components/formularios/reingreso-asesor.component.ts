import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/rx';

import * as moment from 'moment-timezone';
declare var jQuery:any;
declare var Noty:any;

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reingreso-asesor',
  templateUrl: './reingreso-asesor.component.html',
  styleUrls: []
})
export class ReingresoAsesorComponent implements OnInit {

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @ViewChild( DaterangePickerComponent ) private picker: DaterangePickerComponent

  formAddAsesor:FormGroup;
  listProfiles
  listProfileLoaded:boolean = false

  flagLoading = {
    ciudad: false,
    oficina: false,
    departamento: false,
    puesto: false
  }

  flagExists = {
    ciudad: false,
    oficina: false,
    departamento: false,
    puesto: false
  }

  cambioPuesto = {
    fecha_solicitud: ""
  };

  asesorDetailsForm:any = {
    profile:              { tipo: 'select',   icon: 'fa fa-product-hunt fa-fw',       show: true,   readonly: false,  pattern: ''},
    tipo_contrato:        { tipo: 'select2',  icon: 'fa fa-indent fa-fw',             show: true,   readonly: false,  pattern: ''},
    fin_contrato:         { tipo: 'date',     icon: 'fa fa-calendar fa-fw',           show: false,  readonly: false,  pattern: 'Debe coincidir con el formato YYY-MM-DD'},
  }

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left",
    ranges: {
               'Today': [moment(), moment()]
            }
  }

  //Populate lists
  listOptions = {
    ciudad: [],
    oficina: [],
    departamento: [],
    puesto: []
  }

  //Populate lists
  listContrato = [
    {id: 1, name: "Temporal"},
    {id: 2, name: "Indefinido"}
  ]


  parentModal:string

  defaultForm = {
    asesor: '',
    applier: null,
    factor: '1'
  }

  saveAlert:boolean = false
  retrieving:boolean = false
  errorMsg:string

  constructor(
              private _dateRangeOptions: DaterangepickerConfig,
              private route:Router,
              private _api:ApiService,
              public toastr: ToastsManager, vcr: ViewContainerRef,
              ) {
      this.toastr.setRootViewContainerRef(vcr);

      this.populateProfiles()

      this._dateRangeOptions.settings = {
        autoUpdateInput: false,
        locale: { format: "YYYY-MM-DD" }
      }

      this.formAddAsesor = new FormGroup({
        asesor:             new FormControl('', [ Validators.required ] ),
        profile:            new FormControl('', [ Validators.required ] ),
        fechaCambio:        new FormControl('', [ Validators.required,  Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
        fin_contrato:       new FormControl('', [ Validators.required,  Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ] ),
        ciudad:             new FormControl('', [ Validators.required ] ),
        oficina:            new FormControl('', [ Validators.required ] ),
        departamento:       new FormControl('', [ Validators.required ] ),
        puesto:             new FormControl('', [ Validators.required ] ),
        tipo_contrato:      new FormControl('', [ Validators.required ] ),
        factor:             new FormControl('1', [ Validators.required,  Validators.pattern("^[0-1]{1}($|[.]{1}[0-9]*$)") ] ),
        applier:            new FormControl('')
      })

      // Cambio en Fecha de Cambio -- Load Ciudad
      this.formAddAsesor.controls['fechaCambio'].valueChanges.subscribe( res => {
        if( this.formAddAsesor.controls['fechaCambio'].valid){
          this.puestoChange( res, 'ciudad')
        }
      });

      // Cambio en Ciudad -- Load Oficina
      this.formAddAsesor.controls['ciudad'].valueChanges.subscribe( res => {
        if( this.formAddAsesor.controls['ciudad'].valid){
          this.puestoChange( res, 'oficina')
        }
      });

      // Cambio en Oficina -- Load Departamento
      this.formAddAsesor.controls['oficina'].valueChanges.subscribe( res => {
        if( this.formAddAsesor.controls['oficina'].valid){
          this.puestoChange( res, 'departamento')
        }
      });

      // Cambio en Departamento -- Load Puesto
      this.formAddAsesor.controls['departamento'].valueChanges.subscribe( res => {
        if( this.formAddAsesor.controls['departamento'].valid){
          this.puestoChange( res, 'puesto')
        }
      });

      // Cambio en Puesto -- Console Log
      this.formAddAsesor.controls['puesto'].valueChanges.subscribe( res => {

      });

      // Cambio en Factor -- Console Log
      this.formAddAsesor.controls['factor'].valueChanges.subscribe( res => {
        if( this.formAddAsesor.controls['puesto'].valid){
          let salario = this.formAddAsesor.controls['puesto'].value['salario']
          jQuery('#salarioEstablecido').val(res * salario)
        }
      });

      this.formAddAsesor.controls['tipo_contrato'].valueChanges.subscribe( res => {
        switch(res){
          case '2':

           this.formAddAsesor.get('fin_contrato').setValidators([ Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ])
           this.formAddAsesor.get('fin_contrato').reset()
           this.asesorDetailsForm.fin_contrato['show'] = false
           break
          case '1':

            this.formAddAsesor.get('fin_contrato').setValidators([ Validators.required, Validators.pattern("^[2]{1}[0]{1}[1-2]{1}[0-9]{1}[-]{1}([0]{1}[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-1]{1})$") ])
            this.asesorDetailsForm.fin_contrato['show'] = true
            break
          default:
            break
        }

      });

  }

  ngOnChanges(){

  }

  ngOnInit() {



  }

  askCambio(){

  }

  populateProfiles(){
    let params = {}
    this._api.postFromApi( params, 'listProfiles' )
            .subscribe( res => {
              this.listProfiles = res
              this.listProfileLoaded = true

            })
  }

  userExists( control: FormControl ): Promise<any>|Observable<any>{

    let thisData:any = this

    let promesa = new Promise(
      (resolve, reject) =>{

        let params = {
          user: control.value,
          asesor: 0
        }

        thisData._api.postFromApi( params, 'validateUserExists')
          .subscribe( res => {
            if(res){
              if(res.res == 1){
                resolve({existe: true})
              }else{
                resolve(null)
              }
            }
          })

      }
    )
    return promesa
  }

  buildForm( asesor ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.defaultForm = {
      asesor: asesor.idAsesor,
      applier: currentUser.hcInfo['id'],
      factor: '1'
    }
    this.formAddAsesor.reset( this.defaultForm )
  }

  closeModal(){
    // jQuery("#form_cambioPuesto").modal('hide')
    // if(this.parentModal){
    //   jQuery(this.parentModal).modal('show')
    // }
    this.closeDialog.emit("#form_cambioPuesto")

  }

  setVal( val, control ){
    this.formAddAsesor.controls[control].setValue( val.format("YYYY-MM-DD") )
  }



  puestoChange( newVal, tipo ){


      if(newVal != ''){

        this.flagLoading[ tipo ] = true

        setTimeout( () => {

          if(true){
            let currentUser = JSON.parse(localStorage.getItem('currentUser'));

            let params = this.formAddAsesor.value
            params.type = tipo
            // params.puestoClave = currentUser.hcInfo['hc_puesto_clave']
            params.puestoClave = "B1"
            params.areaID = currentUser.hcInfo['hc_area']
            params.udnID = currentUser.hcInfo['hc_udn']
            // params.viewAll = currentUser.credentials['view_all_agents']
            params.viewAll = currentUser.credentials[0]

            this._api.postFromApi( params, "vacantes_disponibles" )
                  .subscribe( res => {

                    console.log( res )

                    if( res ){
                      if(res.error == 0){
                        this.resetOptions( tipo );
                        this.listOptions[tipo] = res.vac

                        this.flagExists[ tipo ] = true
                      }else{
                          this.toastr.error(res.msg, 'Error!', {
                            positionClass: 'toast-top-center',
                            animate: 'fade'
                          });

                          // console.log( res.msg )
                          this.resetOptions( tipo );

                          this.flagExists[ tipo ] = false
                        }
                      }

                      this.flagLoading[ tipo ] = false

                  })
            }
          },500)


      }else{
        this.resetOptions( tipo );
      }


  }

  resetForm(){
    this.formAddAsesor.reset()
  }

  resetOptionSingle( control ){
    this.listOptions[ control ]=[]
    this.flagLoading[ control ] = false
    this.flagExists[ control ] = false
    this.formAddAsesor.controls[ control ].setValue( '' )
  }

  resetOptions( tipo ) {
    switch(tipo){
      case "ciudad":
        this.resetOptionSingle( 'ciudad' )
        this.resetOptionSingle( 'oficina' )
        this.resetOptionSingle( 'departamento' )
        this.resetOptionSingle( 'puesto' )
        break;
      case "oficina":
        this.resetOptionSingle( 'oficina' )
        this.resetOptionSingle( 'departamento' )
        this.resetOptionSingle( 'puesto' )
        break;
      case "departamento":
        this.resetOptionSingle( 'departamento' )
        this.resetOptionSingle( 'puesto' )
        break;
      case "puesto":
        this.resetOptionSingle( 'puesto' )
        break;

    }
  }

  test( something ){

    console.log(something)
  }

  submit (  ){

    this.retrieving = true

    let restfulController:string = "SolicitudBC/reIngreso"

    // console.log(this.formAddAsesor)
    this._api.restfulPut( this.formAddAsesor.value, restfulController )
            .subscribe( res => {
              this.retrieving = false

              if(res.ERR){

                this.saveAlert = true
                this.errorMsg = res.msg

              }else{

                this.save.emit({status: true})

              }

            })

    // console.log( this.formAddAsesor.value )
  }


}
