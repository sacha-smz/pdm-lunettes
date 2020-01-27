<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use App\Frame;

class FrameController extends Controller
{
	
    public function getCotes(Request $request){
		$ref = $request->input('ref');
		
		$frame = Frame::where('ref', $ref)->firstOrFail();
		
		$cotes = [
			'a_int' => $frame->cote_a_int,
			'b_int' => $frame->cote_b_int,
			'd' => $frame->cote_d,
			'drageoir' => ($frame->cote_a - $frame->cote_a_int) / 2
		];
		
		echo( json_encode($cotes) );
	}

}
