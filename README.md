<h1>Sharepoint-Meatball</h1>
<h3>
  <dl>
    <dt>Mission Statement</dt>
    <dd>
      Allows users to change color circles (meatballs) through a popover inorder
      to improve work productivity
    </dd>
  </dl>
</h3>
<dl>
  <dt>Execution</dt>
  <dd>
    The meatball script exists on the Sharepoint main page. If you do not see
    the script, then proceed to request it to be added to your organization's
    main page.
  </dd>
  <dd>
    The meatball script requires jquery to run.  If you see an error message indicating an improperly loaded script, then make sure request jquery to be added to your organization's main page.
  </dd>
  <dt>In order for it to be used, the following must be met</dt>
  <dd>
    <ul>
      <li>
        One select column of values. The presumed values are:
        <ul>
          <li>Up</li>
          <li>Down</li>
          <li>Degraded</li>
          <li>NA</li>
          <li>100-90</li>
          <li>89-79</li>
          <li>79-10</li>
          <li><79</li>
          <li><10</li>
        </ul>
        It can be any combination of these values.
      </li>
      <li>
        If you wish to have custom values:
        <ol>
          <li>
            Add a script editor to the page
          </li>
          <li>
            Write the following inside the script editor:
            <script>
              var meatball_override = [ </br>
                { value: "", color: "" }, </br>
                { value: "", color: "" }, </br>
              ];</br>
            </script>
          </li>
          <li>
            The values must line up with the custom values. The colors can be
            words or # code.
            <a href="http://colorcode.is/">Color Code</a> can be helpful here.
          </li>
          <li>
            Example:
            <script>
              var meatball_override = [</br>
                { value: "Hi", color: "orange" },</br>
                { value: "Editor", color: "brown" },</br>
                { value: "You", color: "black" },</br>
                { value: "Got", color: "gray" },</br>
                { value: "This", color: "#ee00ee" },</br>
              ];</br>
            </script>
          </li>
        </ol>
      </li>
    </ul>
  </dd>
  <dt>History Messages</dt>
		<dd>Once a meatball is populated in the cell then history can be documented</dd></br>
  
	<dd>
	To create a message hover over the meatball and click the "Show More" button at the bottom of the panel. This opens up a drawer on the right side of your screen.  
		</br>

		Type your message in the text input and then hit send. The message will appear and you can also edit and delete your own messages.
			</br>
			</br>
		Note: Your name, time and date are all recorded and are placed into the message. Automated messages happen when a status change occurs.
			</br>
			</br>
	</dd>
    
  <dt>Debugging</dt>
  <dd>
    The following should help fix most issues with the script.
    <ol>
      <li>
        Check the page's lists.
      </li>
      <li>
        Check the column names, including the hidden ones.
      </li>
      <li>
        Verify column names haven't been changed.
      </li>
      <li>
        Verify the values in each select column and ensure they match with
        defaults or overrides.
      </li>
      <li>
        Verify the overrides are created correctly.
      </li>
    </ol>
  </dd>
  <dd>
    If error persists, then contact the developers.
    <br />
    At the top of the meatball.js, a variable called debug exists. Toggle it to
    true, and error notifications will pop up containing the error message.
    <br />
    Once finished, toggle it back to false.
  </dd>
</dl>
