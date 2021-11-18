import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  geojson:any ;
  
  static getData() {
    throw new Error('Method not implemented.');
  }
  constructor(private httpClient:HttpClient) { }
  // getData(){
  //   return this.httpClient.get('http://127.0.0.1:8000//addEmp');
  // }
  addEM(data){
    return this.httpClient.post('http://127.0.0.1:8000/api/addEmp',data);
  }
  getData(){
    return this.httpClient.get('http://127.0.0.1:8000/api/employees');
  }
  login(data){
    return this.httpClient.post('http://127.0.0.1:8000/api/login',data);
  }
}

