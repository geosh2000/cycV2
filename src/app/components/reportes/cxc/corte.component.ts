import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { ApiService } from '../../../services/api.service';
declare var jQuery:any;

@Component({
  selector: 'app-corte',
  templateUrl: './corte.component.html',
  styles: []
})
export class CorteComponent implements OnInit {

  @Output() msg       = new EventEmitter<any>()
  @Output() success   = new EventEmitter<any>()
  @Output() statusChg = new EventEmitter<any>()

  dataCxcs:any
  loading:boolean = false
  chgLoading = {}
  corte:any

  listHisto:any
  histoLoading:boolean = false

  editLoading:boolean = false

  allChecked:boolean = false
  checkBoxes:any
  selectedBoxes:any = {}
  checkedNum:number = 0
  ammountEdit:number = 0
  ammountSaldo:number = 0
  editedID:any


  constructor(
              private _api: ApiService) {


  }

  ngOnInit() {
  }

  checkBuilder( id, status ){

    if(status){
      this.selectedBoxes[ id ] = true
    }else{
      if( this.selectedBoxes[ id ] ){
        delete this.selectedBoxes[ id ]
      }
    }

    this.checkedNum = Object.keys(this.selectedBoxes).length

    if( this.checkedNum == this.checkBoxes ){
      this.allChecked = true
    }else{
      this.allChecked = false
    }

    // console.log( `${Object.keys(this.selectedBoxes).length} de ${this.dataCxcs.length}`, this.allChecked )

  }

  selectAll(){
    if( this.allChecked ){
      jQuery('.cxc-check').prop('checked', false)
      this.selectedBoxes = {}
      this.checkedNum = 0
      this.allChecked = false
    }else{
      jQuery('.cxc-check').prop('checked', true)
      for( let item of this.dataCxcs ){
        this.selectedBoxes[ item.id ] = true
      }
      this.checkedNum = this.checkBoxes
      this.allChecked = true
    }
  }

  build( corte ){
      this.selectedBoxes = {}
      this.checkedNum = 0
      this.allChecked = false
      this.corte = corte
      this.loading = true
      this._api.restfulGet( corte, 'cxc/aplicadosCorte' )
              .subscribe( res => {
                            if(res['ERR']){
                                this.msg.emit( { msg: res.msg, title: 'ERROR'} )
                            }else{
                                this.dataCxcs = res.data
                                this.checkBoxes = this.dataCxcs.length
                            }
                            this.loading = false

                          }, err => {
                            let errores = JSON.parse( err._body )
                            this.msg.emit( { msg: errores.msg, title: err.statusText} )
                            this.loading = false
                          })

  }

  chgStatus(id, status){
    this.statusChg.emit( {id: [id], status: status, type: 'single' } )
  }

  chgStatusMulti( status ){
    let ids = []
    for( let key in this.selectedBoxes ){
      console.log(key)
      ids.push(key)
    }

    this.statusChg.emit( {id: ids, status: status, type: 'multi' } )
  }

  showHisto( id ){

    this.histoLoading = true
    this.listHisto = null

    this._api.restfulGet( id, 'cxc/getHistoric' )
      .subscribe( res => {

        this.listHisto = res.data
        this.histoLoading = false
        jQuery('#historiaCxc').modal('show')
      }, err => {
        let errores = err.json()
        this.msg.emit( { msg: errores.msg, title: err.statusText} )
        this.histoLoading = false
      })



  }

  editCxc( id ){
    console.log(id, this.dataCxcs)
    this.ammountEdit = this.dataCxcs[id].monto_Quincena
    this.ammountSaldo = 0
    this.editedID = this.dataCxcs[id]

    jQuery("#inputComments").val('')
    jQuery("#inputNewMonto").val(this.dataCxcs[id].monto_Quincena)
    jQuery("#editCxc").modal('show')
  }

  calcSaldo(){
    this.ammountSaldo = this.ammountEdit - jQuery("#inputNewMonto").val()
  }

  submitEdit(){
    this.editLoading = true

    let params = {
      'newAmmount': jQuery("#inputNewMonto").val(),
      'id':         this.editedID.id,
      'cxc':        this.editedID.pago_ID,
      'saldo':      this.ammountEdit,
      'comments':   jQuery("#inputComments").val()
    }

    this._api.restfulPut( params, 'cxc/editAmmount' )
            .subscribe( res => {
              this.success.emit( res.msg )
              jQuery("#editCxc").modal('hide')
              this.editLoading = false
            }, err => {
              let errores = err.json()
              this.msg.emit( { msg: errores.msg, title: err.statusText} )
              this.editLoading = false
            })
  }

}
