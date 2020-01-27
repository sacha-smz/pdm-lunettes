<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use App\Frame;

class MainController extends Controller
{
    public function show(){
		$frames = Frame::select('ref')->get();
		
		return view( 'pupil-meter', ['frames' => $frames] );
	}
}
