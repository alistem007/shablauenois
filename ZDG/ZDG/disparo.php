<?php

set_time_limit(0);

$txt = $_POST['txt'] . PHP_EOL;
$min = $_POST['min'];
$max = $_POST['max'];
$saudacaoInput = $_POST['saudacao'];
$saudacao = explode(';', $saudacaoInput);
$despedidaInput = $_POST['despedida'];
$despedida = explode(';', $despedidaInput);
$urlTxt = $_POST['url'] . 'send-message';
$urlMedia = $_POST['url'] . 'send-media';
$urlFile = $_POST['urlFile'];
$titulo = $_POST['titulo'];
$leads = $_POST['leads'];
$lines = explode(PHP_EOL, $leads);

if (isset($_POST['img'])) {
	foreach ($lines as $line) {
		//seta mensagem para o cliente
		list($first) = explode(",", $line);
		list($_, $second) = explode(",", $line);
		list($_,$_, $third) = explode(",", $line);
		//dispara a mensagem da API para o cliente
		$dataFile = array('sender' => $third, 'number' => $first, 'caption' => $titulo, 'file' => $urlFile);
		// use key 'http' even if you send the request to https://...
		$optionsFile = array(
			'http' => array(
				'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
				'method'  => 'POST',
				'content' => http_build_query($dataFile)
			)
		);
		// Enviar
		sleep ( rand ( $min, $max)); // setar randomização de segundos
		$contextFile  = stream_context_create($optionsFile);
		$resultFile = file_get_contents($urlMedia, false, $contextFile);
		if ($resultFile === FALSE) { /* Handle error */ }
		//echo "<br/>". $resultFile;
		list($_,$rfirst) = explode("{", $resultFile);
		//list($_,$_,$_,$_,$rquart) = explode("{", $resultFile);
		//echo substr($rfirst,0, 13) . " - ";
		//echo substr($rquart,16, 21) . "<br>";
		echo "Enviado para: " . $first . " - Lead: " . $second . " - Bloco: " . $third . " - Status do envio: " . substr($rfirst,9, 4) . "<br>";
}
} else {
foreach ( $lines as $line )
{
	list($first) = explode(",", $line);
	list($_, $second) = explode(",", $line);
	list($_,$_, $third) = explode(",", $line);
	$msgsaudacao = $saudacao[array_rand($saudacao)];
	$msgdespedida = $despedida[array_rand($despedida)];
	$msg = $msgsaudacao . $txt . $msgdespedida;
	//dispara a mensagem da API para o cliente
	$data = array('sender' => $third, 'number' => $first, 'message' => $second . "\r\n" . $msg);	
	// use key 'http' even if you send the request to https://...
	$options = array(
		'http' => array(
			'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
			'method'  => 'POST',
			'content' => http_build_query($data)
		)
	);
	// Enviar
	sleep ( rand ( $min, $max)); // setar randomização de segundos
	$context  = stream_context_create($options);
	$result = file_get_contents($urlTxt, false, $context);
	if ($result === FALSE) { /* Handle error */ }
	list($_,$rfirst) = explode("{", $result);
	echo "Enviado para: " . $first . " - Lead: " . $second . " - Bloco: " . $third . " - Status do envio: " . substr($rfirst,9, 4) . "<br>";
}
}


// ESTRATÉGIA ZAP DAS GALÁXIAS
// ZDG © 2020
// www.zapdasgalaxias.com.br