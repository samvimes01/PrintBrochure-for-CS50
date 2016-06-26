<?php
if ($_SERVER["REQUEST_METHOD"] == "GET")
{
	//first run to authorize redirect from pushbullet
	if (!isset($_GET['code'])){
		header("Location: http://portfolios.pp.ua/");
		exit;
	}
	else
	{
		$code = $_GET['code'];	
		//get token from code
		if( $curl = curl_init() ) {
			$arr = array('client_id' => 'SFTKCPyO9yall9BpeNxUaPIxREYLL5lz', 'client_secret' => 'WXNVZhrSpDox0RjvO0APNkjdmFshOc8A', 'code' => $code, 'grant_type' => 'authorization_code');
			$push = json_encode($arr);
			//echo $push;
			curl_setopt($curl, CURLOPT_URL, 'https://api.pushbullet.com/oauth2/token');
			curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
			curl_setopt($curl, CURLOPT_POST, true);
			curl_setopt($curl, CURLOPT_POSTFIELDS, $push);
			curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
			$out = json_decode(curl_exec($curl), true);
			$token = $out["access_token"];
			curl_close($curl);
		}
		//get current user with token from pushbullet
		if( $curl = curl_init() ) {
			curl_setopt($curl, CURLOPT_URL, 'https://api.pushbullet.com/v2/users/me');
			curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
			curl_setopt($curl, CURLOPT_HTTPHEADER, array("Access-Token:".$token));
			$out = json_decode(curl_exec($curl), true);
			$iden = $out["iden"];
			curl_close($curl);
		}

		?>
		
		<!DOCTYPE html>
		<html>
			<head>
				<script type="text/javascript">
					var iden = "<?php echo $iden; ?>";
					var token = "<?php echo $token; ?>";

					window.onload = function() {
						localStorage.setItem("iden",iden);
						localStorage.setItem("token",token);
						window.location = "http://portfolios.pp.ua/";
					};
				</script>
			</head>
			<body>
			</body>
		</html>
		
		<?php
		exit;
	}
}
if ($_SERVER["REQUEST_METHOD"] == "POST")
{
	if( $curl = curl_init() ) {
		$arr = array('body' => $_POST['body'], 'title' => 'PrinBrochure pages', 'type' => 'note', 'iden' => $_POST['iden']);
		$push = json_encode($arr);
		curl_setopt($curl, CURLOPT_URL, 'https://api.pushbullet.com/v2/pushes');
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $push);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array("Access-Token:".$_POST['token'], 'Content-Type:application/json'));
		$exec = curl_exec($curl);
		//$token = json_decode($exec, true);
		//$token["access_token"];
		curl_close($curl);
		echo $exec;
		exit;
	}
}
?>