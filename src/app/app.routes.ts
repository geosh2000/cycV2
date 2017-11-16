import { RouterModule, Routes } from '@angular/router';
import { DetailAsesorComponent } from './components/detail-asesor/detail-asesor.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/shared/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ForecastProgramacionComponent } from './components/forecast-programacion/forecast-programacion.component';
import { VacantesComponent } from './components/hc/vacantes.component';
import { AprobacionesComponent } from './components/rrhh/aprobaciones.component';
import { NominaComponent } from './components/rrhh/nomina.component';
import { CxcComponent } from './components/rrhh/cxc.component';
import { AprobarVacantesComponent } from './components/rrhh/aprobar-vacantes.component';
import { ApplyAllCxcComponent } from './components/formularios/apply-all-cxc.component';
import { BitacoraSupersComponent } from './components/formularios/bitacora-supers/bitacora-supers.component';
import { CuartilesComponent } from './components/reportes/cuartiles/cuartiles.component';
import { PrecisionComponent } from './components/reportes/precision/precision.component';
import { PorIntervaloComponent } from './components/reportes/precision/por-intervalo.component';
import { AddExternalUserComponent } from './components/config/add-external-user.component';
import { ChangeSupervisorComponent } from './components/config/change-supervisor.component';
import { PyaComponent } from './components/monitors/pya.component';
import { CambioPdvComponent } from './components/pdv/cambio-pdv.component';
import { TestComponent } from './test/test/test.component';
import { LiveTabComponent } from './components/monitors/venta/live-tab.component';
import { AsistenciaComponent } from './components/reportes/asistencia/asistencia.component';
import { CxcAdminComponent } from './components/reportes/cxc/cxc-admin.component';
import { HxConfigComponent } from './components/config/horarios/hx-config.component';
import { VentaPorCanalComponent } from './components/reportes/venta/venta-por-canal.component';

const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },

  // DetalleAsesores
  { path: 'detail-asesor', component: DetailAsesorComponent },
  { path: 'detail-asesor/:id', component: DetailAsesorComponent },
  { path: 'detail-asesor/:id/:tipo', component: DetailAsesorComponent },

  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'notFound', component: NotFoundComponent },
  { path: 'forecastProgramacion', component: ForecastProgramacionComponent },

  // Vacantes
  { path: 'vacantes', component: VacantesComponent },
  { path: 'vacantes/:type', component: VacantesComponent },
  { path: 'vacantes/:type/:udn', component: VacantesComponent },
  { path: 'vacantes/:type/:udn/:area', component: VacantesComponent },
  { path: 'vacantes/:type/:udn/:area/:dep', component: VacantesComponent },
  { path: 'vacantes/:type/:udn/:area/:dep/:puesto', component: VacantesComponent },
  { path: 'vacantes/:type/:udn/:area/:dep/:puesto/:alias', component: VacantesComponent },

  // RRHH
  { path: 'aprobaciones_rrhh', component: AprobacionesComponent },
  { path: 'nomina', component: NominaComponent },
  { path: 'aprobarVacantes', component: AprobarVacantesComponent },

  // Reportes
  { path: 'cuartiles', component: CuartilesComponent },
  { path: 'precisionPronostico', component: PrecisionComponent },
  { path: 'precisionPorIntervalo', component: PorIntervaloComponent },
  { path: 'asistencia', component: AsistenciaComponent },
  { path: 'mp/ventaPorCanal', component: VentaPorCanalComponent },

  //Bitacoras
  { path: 'bitacoraSupervisores', component: BitacoraSupersComponent },

  //Monitores
  { path: 'pya', component: PyaComponent },
  { path: 'ventaMonitor', component: LiveTabComponent },

  // CXC
  { path: 'cxc', component: CxcComponent },
  { path: 'cxcAdmin', component: CxcAdminComponent },
  { path: 'cxc/rrhh', component: ApplyAllCxcComponent },
  { path: 'cxc/rrhh/:filter', component: ApplyAllCxcComponent },

  // Config
  { path: 'config/addExternal', component: AddExternalUserComponent },
  { path: 'config/chgSuper', component: ChangeSupervisorComponent },
  { path: 'config/hxConfig', component: HxConfigComponent },

  // PDV
  { path: 'cambios-pdvs-asesores', component: CambioPdvComponent },

  //test
  { path: 'test', component: TestComponent },

  { path: '**', pathMatch: 'full', redirectTo: 'notFound' }
];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES, {useHash: true});
