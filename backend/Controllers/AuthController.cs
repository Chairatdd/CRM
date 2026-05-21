using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace CrmBackend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    public AuthController(IConfiguration config) => _config = config;

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        // Mock auth — demo only
        var users = new Dictionary<string, (string name, string role)>
        {
            ["admin"]  = ("ผู้ดูแลระบบ", "Admin"),
            ["somsak"] = ("สมศักดิ์ เจริญ", "Manager"),
            ["wanida"] = ("วนิดา สุข", "Agent"),
            ["mana"]   = ("มานะ ดี", "Agent"),
        };

        if (!users.TryGetValue(req.Username ?? "", out var user) || req.Password != "demo1234")
            return Unauthorized(new { message = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });

        var token = Convert.ToBase64String(
            System.Text.Encoding.UTF8.GetBytes($"{req.Username}:{DateTime.UtcNow.Ticks}:demo"));

        return Ok(new
        {
            token,
            user = new { username = req.Username, fullName = user.name, role = user.role }
        });
    }

    [HttpGet("me")]
    public IActionResult Me([FromHeader(Name = "Authorization")] string? auth)
    {
        if (string.IsNullOrEmpty(auth))
            return Unauthorized();

        var token = auth.Replace("Bearer ", "").Trim();
        var decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(token));
        var username = decoded.Split(':')[0];

        return Ok(new { username, authenticated = true });
    }
}

public record LoginRequest(string? Username, string? Password);
