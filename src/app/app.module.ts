import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ToastModule, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { CustomOption } from './components/shared/toastrOptions';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FileUploadModule } from 'ng2-file-upload';
import { PopoverModule } from 'ngx-popover';
import { BootstrapSwitchModule } from 'angular2-bootstrap-switch';
import { UiSwitchModule } from 'ngx-toggle-switch';

//services
import { NavbarService } from './services/navbar.service';
import { AsesoresService } from './services/asesores.service';
import { LoginService } from './services/login.service';
import { CredentialsService } from './services/credentials.service';
import { TokenCheckService } from './services/token-check.service';
import { ApiService } from './services/api.service';
import { InitService } from './services/init.service';

//pipes
import { KeysPipe } from './pipes/keys.pipe';
import { CapitalizadoPipe } from './pipes/capitalizado.pipe';

import { APP_ROUTING } from './app.routes';
import { AppComponent } from './app.component';
import { NgSwitchComponent } from './components/ng-switch/ng-switch.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DetailAsesorComponent } from './components/detail-asesor/detail-asesor.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LoginComponent } from './components/shared/login/login.component';
import { CambioPuestoComponent } from './components/formularios/cambio-puesto.component';
import { ForecastProgramacionComponent } from './components/forecast-programacion/forecast-programacion.component';
import { VacantesComponent } from './components/hc/vacantes.component';
import { ShowDetailAsesorComponent } from './components/detail-asesor/show-detail-asesor.component';
import { EditDetailsComponent } from './components/formularios/edit-details.component';
import { SetBajaComponent } from './components/formularios/set-baja.component';
import { AgregarCxcComponent } from './components/formularios/agregar-cxc.component';
import { SaldarCxcComponent } from './components/formularios/saldar-cxc.component';
import { ApplyCxcComponent } from './components/formularios/apply-cxc.component';
import { SancionesComponent } from './components/tables/sanciones.component';
import { AddVacanteComponent } from './components/formularios/add-vacante.component';
import { DeactivateVacanteComponent } from './components/formularios/deactivate-vacante.component';
import { TestComponent } from './test/test/test.component';
import { TableComponent } from './components/tables/table.component';
import { AddAsesorComponent } from './components/formularios/add-asesor.component';
import { AjusteSalarialComponent } from './components/formularios/ajuste-salarial.component';
import { EditarAjusteSalarialComponent } from './components/formularios/editar-ajuste-salarial.component';
import { AddContratoComponent } from './components/formularios/add-contrato.component';
import { AprobacionesComponent } from './components/rrhh/aprobaciones.component';
import { NominaComponent } from './components/rrhh/nomina.component';
import { CxcComponent } from './components/rrhh/cxc.component';
import { ApplyAllCxcComponent } from './components/formularios/apply-all-cxc.component';
import { CuartilesComponent } from './components/reportes/cuartiles/cuartiles.component';
import { PrecisionComponent } from './components/reportes/precision/precision.component';
import { ButtonSaveDirective } from './directives/button-save.directive';
import { PorIntervaloComponent } from './components/reportes/precision/por-intervalo.component';
import { BitacoraSupersComponent } from './components/formularios/bitacora-supers/bitacora-supers.component';
import { AprobarVacantesComponent } from './components/rrhh/aprobar-vacantes.component';
import { AddExternalUserComponent } from './components/config/add-external-user.component';
import { PyaComponent } from './components/monitors/pya.component';
import { CambioPdvComponent } from './components/pdv/cambio-pdv.component';
import { ChangeSupervisorComponent } from './components/config/change-supervisor.component';
import { LiveTabComponent } from './components/monitors/venta/live-tab.component';
import { DomseguroPipe } from './pipes/domseguro.pipe';
import { AsistenciaComponent } from './components/reportes/asistencia/asistencia.component';
import { AddAusentismoComponent } from './components/formularios/add-ausentismo.component';
import { JornadasComponent } from './components/reportes/asistencia/jornadas.component';
import { CxcAdminComponent } from './components/reportes/cxc/cxc-admin.component';
import { CorteComponent } from './components/reportes/cxc/corte.component';
import { NoAcentosPipe } from './pipes/no-acentos.pipe';
import { UploadImageComponent } from './components/formularios/upload-image.component';
import { TableTemplateComponent } from './addon/table-template/table-template.component';
import { ReingresoAsesorComponent } from './components/formularios/reingreso-asesor.component';
import { HxConfigComponent } from './components/config/horarios/hx-config.component';
import { VentaPorCanalComponent } from './components/reportes/venta/venta-por-canal.component';


declare let jQuery : Object;


@NgModule({
  declarations: [
    AppComponent,
    NgSwitchComponent,
    HomeComponent,
    KeysPipe,
    CapitalizadoPipe,
    NavbarComponent,
    DetailAsesorComponent,
    NotFoundComponent,
    LoginComponent,
    CambioPuestoComponent,
    ForecastProgramacionComponent,
    VacantesComponent,
    ShowDetailAsesorComponent,
    EditDetailsComponent,
    SetBajaComponent,
    AgregarCxcComponent,
    SaldarCxcComponent,
    ApplyCxcComponent,
    SancionesComponent,
    AddVacanteComponent,
    DeactivateVacanteComponent,
    TestComponent,
    TableComponent,
    AddAsesorComponent,
    AjusteSalarialComponent,
    EditarAjusteSalarialComponent,
    AddContratoComponent,
    AprobacionesComponent,
    NominaComponent,
    CxcComponent,
    ApplyAllCxcComponent,
    CuartilesComponent,
    PrecisionComponent,
    ButtonSaveDirective,
    PorIntervaloComponent,
    BitacoraSupersComponent,
    AprobarVacantesComponent,
    AddExternalUserComponent,
    PyaComponent,
    CambioPdvComponent,
    ChangeSupervisorComponent,
    LiveTabComponent,
    DomseguroPipe,
    AsistenciaComponent,
    AddAusentismoComponent,
    JornadasComponent,
    CxcAdminComponent,
    CorteComponent,
    NoAcentosPipe,
    UploadImageComponent,
    TableTemplateComponent,
    ReingresoAsesorComponent,
    HxConfigComponent,
    VentaPorCanalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    Ng2CompleterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    APP_ROUTING,
    Daterangepicker,
    ToastModule.forRoot(),
    CommonModule,
    Ng2SmartTableModule,
    FileUploadModule,
    PopoverModule,
    BootstrapSwitchModule.forRoot(),
    UiSwitchModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: "esMX" },
    {provide: ToastOptions, useClass: CustomOption},
    NavbarService,
    AsesoresService,
    LoginService,
    NavbarComponent,
    CredentialsService,
    TokenCheckService,
    ApiService,
    InitService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
