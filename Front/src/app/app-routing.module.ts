import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';
import { FormComponent } from './form/form.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OlMapComponent } from './ol-maps/ol-map/ol-map.component';
import { DataFormComponent } from './data-form/data-form.component';

const routes:Routes=[
{path:"map", component:FormComponent},
{path:"", component:LoginComponent},
{path:"form", component:DataFormComponent}
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports:[RouterModule]
})
export class AppRoutingModule { }
