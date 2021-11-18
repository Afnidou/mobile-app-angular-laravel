<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

use App\Models\employee;
$features=[];
class EmployeeController extends Controller
{
    public function getEmp() {

        $result = employee::select([ "name",\DB::raw("public.ST_AsGeoJSON(geometrie) AS geojson")])->get();

        $features=[];
        foreach ($result as $row) {
            // unset($row['geom']);
            $geometry=$row['geojson']=json_decode($row['geojson']);
             unset($row['geojson']);
            $feature=["type"=>"Feature","properties"=>$row,"geometry"=>$geometry];
            array_push($features,$feature) ;

        }
        $featureCollection=["type"=>"FeatureCollection","features"=>$features];
        $result1=json_encode($featureCollection);

        return response($result1);}

        public function addEmp(Request $request) {

            $emp=employee::create($request->all());
            return response($emp,201);
                                   }

    // public function getEmpbyId($id) {

    //     $emp=employee::find($id);
    //     if (is_null($emp))
    //     {return response()->json(['message'=>'Not found'],404);}
    //     else {
    //         return response()->json($emp::find($id),200);
    //     }}


        //   public function  UpdateEmpbyId(Request $request,$id) {

        //     $emp=employee::find($id);
        //     if (is_null($emp))
        //     {return response()->json(['message'=>'Not found up'],404);}

        //     $emp-> update($request->all());
        //     return response($emp,200);            }

            // public function deleteEmpbyId(Request $request,$id) {

            //     $emp=employee::find($id);
            //     if (is_null($emp))
            //     {return response()->json(['message'=>'Not found delete'],404);}
            //     $emp-> delete();
            //     return response(null,204);

            //                     }


                            }
