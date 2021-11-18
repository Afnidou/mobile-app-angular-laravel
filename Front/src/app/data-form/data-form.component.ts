import { Component, OnInit, Input } from '@angular/core';
import { StorageService } from '../storage.service';
import { Router ,ActivatedRoute } from '@angular/router';
import { FormGroup,FormControl ,Validators } from '@angular/forms';

@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.css']
})
export class DataFormComponent implements OnInit {
  form:any;



  constructor(private StorageService:StorageService,private router:Router, private route:ActivatedRoute) {
    this.form = new FormGroup(

      {Categorie: new FormControl("",Validators.required),
      name: new FormControl("",Validators.required),
      Designation: new FormControl("",Validators.required),
      perimetre: new FormControl("",Validators.required),
      surface: new FormControl("",Validators.required) }
    )

  }

  ngOnInit(): void {

  }
  gotoNext()
  { let data:any =this.form.value ;
    this.router.navigate(['/map'],{
      queryParams:{data:JSON.stringify(data)}
    })
  }



}


