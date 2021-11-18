import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { StorageService } from '../storage.service';
import { FormGroup,FormControl ,Validators } from '@angular/forms';
 import { login } from './login.model';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
forma:any ;

  form=new login();
  constructor(private route:Router,private StorageService :StorageService  ) {

    this.forma = new FormGroup(

      {email: new FormControl("",Validators.required),
      password: new FormControl("",Validators.required) }
    )


   }

  ngOnInit(): void {
  }
 go(){
   this.route.navigate(["/form"])
 }
 login(): void {
  this.form.email=$('#email').val();
  this.form.password=$('#pas').val();
  const data={
    
      "email":"fnidou@etafat.com",
      "password":"123"
  
  }
  this.StorageService.login(this.form).subscribe(res=>{
    console.log('success');
    console.log(res);
    this.route.navigate(["/form"])
    },

    error => {
      console.log('error');
      console.log(error); 
     alert("Mot de passe ou utilisateur incorrect"); 
      this.route.navigate(["/"])
    }

    )
 }
}
