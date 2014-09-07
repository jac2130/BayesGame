using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Net;
using System.IO;

public partial class Proxy : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string proxyURL = string.Empty;
        try
        {
            proxyURL = HttpUtility.UrlDecode(Request.QueryString["u"].ToString());
        }
        catch { }

        if (proxyURL != string.Empty)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(proxyURL);
            request.Method = "GET";
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();

            if (response.StatusCode.ToString().ToLower() == "ok")
            {
                string contentType = response.ContentType;
                Stream content = response.GetResponseStream();
                StreamReader contentReader = new StreamReader(content);
                Response.ContentType = contentType;
                Response.Write(contentReader.ReadToEnd());
            }
        }
    }
}

