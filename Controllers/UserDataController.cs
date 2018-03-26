using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace pizza42.Controllers
{
    [Route("api/[controller]")]
    public class UserDataController : Controller
    {

        private IConfiguration _configuration;

        public UserDataController(IConfiguration Configuration)
        {
            _configuration = Configuration;
        }

        [HttpPost("[action]")]
        public async Task<ActionResult> ProcessLogin([FromBody] Lock0 lock0)
        {

            var model = new UserData();
            model.gender = "";
            model.friendCount = "";

            String accessToken = lock0.accessToken;
            String idTokePayload_sub = lock0.idTokenPayload.sub;

            var auth0Client = new HttpClient();
            string token = "";

            //string bodyString = "{\"client_id\":\"" + Auth0_Client_Id + "\",\"client_secret\":\"" +
            string bodyString = "{\"client_id\":\"" + _configuration["Auth0:ClientId"] + 
                "\",\"client_secret\":\"" + _configuration["Auth0:ClientSecret"] + 
                "\",\"audience\":\"" + _configuration["Auth0:Audience"] + 
                "\",\"grant_type\":\"client_credentials\"}";

            var response = await auth0Client.PostAsync("https://roses.auth0.com/oauth/token", new StringContent(bodyString, Encoding.UTF8, "application/json"));

            string email = "";

            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();
                var responseJson = JObject.Parse(responseString);
                token = (string)responseJson["access_token"];
 
            }
            
            // -- OK now I have a token
            // -- let's call the management API to get the user profile
            string id = lock0.idTokenPayload.sub;
            //-- we'll just work with a generic JObject for simplicity
            JObject profile = await GetAuth0UserProfile(id, token);
            email = (string)profile["email"];

            // -- what kind of user?
            if (lock0.idTokenPayload.sub.StartsWith("auth0"))
            {
                JObject fullContact = await GetFullContactData(email);
                model.friendCount = "0";
                model.gender = "Unknown";
                try {
                    model.gender = (string)fullContact["gender"];
                }
                catch (Exception e)
                {
                    // -- guess we didn't get anything back
                    System.Console.WriteLine("Err: " + e.Message);
                }
            }
            else if(lock0.idTokenPayload.sub.StartsWith("facebook"))
            {
                // -- we'll just work directly with json vs. create an object, etc.
                // -- future, add try/catch block
                string facebookAccessToken = (string)profile["identities"][0]["access_token"];
                string facebookUserID = (string)profile["identities"][0]["user_id"];

                JObject facebookData = await GetFacebookData(facebookUserID, facebookAccessToken);

                try { 
                    model.gender = (string)facebookData["gender"];
                    model.friendCount = (string)facebookData["friends"]["summary"]["total_count"];
                }
                catch (Exception e)
                {
                    System.Console.WriteLine("Err: " + e.Message);
                }

            }

            return await Task<ActionResult>.FromResult(Json(model));

        }

        // -- just change the return type to json
        public async Task<JObject> GetAuth0UserProfile(string id, string token)
        {
            JObject json = null;

            var client = new HttpClient();

            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Bearer", token);

            var response = await client.GetAsync(
                _configuration["Auth0:RosesManagementApi"] + "/users/" + id); 


            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();
                json = JObject.Parse(responseString);

                System.Console.WriteLine("result: " + responseString);

            }
            else
            {
                System.Console.WriteLine("response: " + response.StatusCode);
            }

            return await Task<JObject>.FromResult(json);

        }

        public async Task<JObject> GetFacebookData(string id, string token)
        {
            JObject json = null;

            var client = new HttpClient();

            client.DefaultRequestHeaders.Add("Accept", "application/json");

            var response = await client.GetAsync(
                "https://graph.facebook.com/" + id + "?fields=friends,gender&access_token=" + token);

            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();
                json = JObject.Parse(responseString);

                System.Console.WriteLine("result: " + responseString);

            }
            else
            {
                System.Console.WriteLine("response: " + response.StatusCode);
            }

            return await Task<JObject>.FromResult(json);

        }

        public async Task<JObject> GetFullContactData(string email)
        {
            JObject json = new JObject();

            var client = new HttpClient();

            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Bearer", _configuration["Auth0:FullContactKey"]);

            string bodyString = "{\"email\": \"" + email + "\"}";

            var response = await client.PostAsync(
               _configuration["Auth0:FullContactApi"] + "/person.enrich", new StringContent(bodyString, Encoding.UTF8, "application/json"));

            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();
                json = JObject.Parse(responseString);

                System.Console.WriteLine("result: " + responseString);

            }
            else
            {
                System.Console.WriteLine("response: " + response.StatusCode);
            }

            return await Task<JObject>.FromResult(json);

        }
  
        public class IdTokenPayload
        {
            public string sub { get; set; }
        }

        public class Lock0
        {
            public string accessToken { get; set; }
            public string idToken { get; set; }
            public IdTokenPayload idTokenPayload { get; set; }
            public object appState { get; set; }
            public object refreshToken { get; set; }
            public string state { get; set; }
            public int expiresIn { get; set; }
            public string tokenType { get; set; }
            public object scope { get; set; }
        }

        public class UserData
        {
            public string gender { get; set; }
            public string friendCount { get; set; }
        }



        /*
        public class Auth0Identity
        {
            public string user_id { get; set; }
            public string provider { get; set; }
            public string connection { get; set; }
            public bool isSocial { get; set; }
        }

        public class Auth0Profile
        {
            public bool email_verified { get; set; }
            public string email { get; set; }
            public DateTime updated_at { get; set; }
            public string name { get; set; }
            public string picture { get; set; }
            public string user_id { get; set; }
            public string nickname { get; set; }
            public List<Auth0Identity> identities { get; set; }
            public DateTime created_at { get; set; }
            public string last_ip { get; set; }
            public DateTime last_login { get; set; }
            public int logins_count { get; set; }
        }
        */
    }
}






