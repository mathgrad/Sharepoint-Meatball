    <h1>Sharepoint-Meatball</h1>
    <h3>
      <dl>
        <dt>Mission Statement</dt>
        <dd>
          Allows users to change color circles (meatballs) through a popover
          inorder to improve work productivity
        </dd>
      </dl>
    </h3>
    <dl>
      <dt>Exection</dt>
      <dd>
        The meatball script exists on the sharepoint main page. If you do not
        see the script, then proceed to request it to be added to your
        organization's main page.
      </dd>
      <dt>Inorder for it to be used, the following must be met</dt>
      <dd>
        <ol>
          <li>
            Two columns that must contain status, and another that contains
            value. For example: NIPR Status and NIPR Status Value are valid.
          </li>
          <li>
            In the calculation column, the meatball element must have a key
            value. For example: if a green meatball is displayed if the value is
            (100 - 90). Then set the key attribute to be (100 - 90) like this
            [key="100-90"]
          </li>
          <li>
            The value column, must be a select column.
          </li>
          <li>
            The names for both of the columns must be the original names. If the
            names have changed, then the script will not work. You will need to
            delete and add in the new column with the appropriate name. (This is
            a quirk of Sharepoint's ID management system, and beyond what the
            script can do).
          </li>
        </ol>
      </dd>
    </dl>
    <a
      href="https://app.tettra.co/teams/imef-imo/pages/sharepoint-list-creating-meatball-status-icons?auth=86ad50a524415260aa173fcf1e279d8d6efb987d2efafa798a09ee6898acede94d47b91a1a5892bd83cd000489d0f1b7"
      >Addtional Document</a>
