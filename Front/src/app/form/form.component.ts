import { Router ,ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { StorageService } from '../storage.service';
import { FormGroup,FormControl ,Validators } from '@angular/forms';
 import { form } from './form.model';
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  forma:any;
  data:any;
form=new form();

  constructor(private StorageService :StorageService ,private router:Router, private route:ActivatedRoute) {


    // this.forma = new FormGroup(
    //     {geometrie: new FormControl("",Validators.required),
    //      categorie11: new FormControl("",Validators.required),
    //    name11: new FormControl("",Validators.required),
    //      Designation11: new FormControl("",Validators.required),
    //   surface: new FormControl("",Validators.required),
    //    perimetre: new FormControl("",Validators.required),
    // }
    // )
      }
  ngOnInit():void {
    this.route.queryParams.subscribe((params)=>{
      console.log(params);
      this.data=JSON.parse(params.data); })


  }
    do(){
      this.StorageService.getData().subscribe((res)=>{
        this.StorageService.geojson=res;})
    }

  submit(){
    this.form.categorie=$('#cat').val();
    this.form.geometrie=$('#wktgeom').val();
    this.form.surface=$('#sur').val();
    this.form.perimetre=$('#peri').val();
    this.form.Designation=$('#desi').val();
    this.form.name=$('#nm').val();
   this.StorageService.addEM(this.form).subscribe(res=>{
     console.log(res);
   });

}

}

