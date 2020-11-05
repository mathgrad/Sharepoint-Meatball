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
  <dt>Exection</dt>
  <dd>
    The meatball script exists on the sharepoint main page. If you do not see
    the script, then proceed to request it to be added to your organization's
    main page.
  </dd>
  <dt>Inorder for it to be used, the following must be met</dt>
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
          <li>89-80</li>
          <li>79-10</li>
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
              var meatball_override = [</br>
                { value: "", color: "" },</br>
                { value: "", color: "" },</br>
              ];
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
              var meatball_override = [
                { value: "Hi", color: "orange" },
                { value: "Editor", color: "brown" },
                { value: "You", color: "black" },
                { value: "Got", color: "gray" },
                { value: "This", color: "#ee00ee" },
              ];
            </script>
          </li>
        </ol>
      </li>
    </ul>
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
</dl>
<a
  href="https://app.tettra.co/teams/imef-imo/pages/sharepoint-list-creating-meatball-status-icons?auth=86ad50a524415260aa173fcf1e279d8d6efb987d2efafa798a09ee6898acede94d47b91a1a5892bd83cd000489d0f1b7"
  >Addtional Document</a
>
