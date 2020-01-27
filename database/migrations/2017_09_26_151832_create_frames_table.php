<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFramesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('frames', function (Blueprint $table) {
            $table->increments('id');
			$table->string('ref');
			$table->double('cote_a', 5, 2);
			$table->double('cote_d', 5, 2);
			$table->double('cote_a_int', 5, 2);
			$table->double('cote_b_int', 5, 2);
			$table->string('category');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('frames');
    }
}
