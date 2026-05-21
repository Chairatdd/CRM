using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace CrmBackend.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IConfiguration _config;
    public UsersController(IConfiguration config) => _config = config;

    private static object MapUser(MySqlDataReader r) => new
    {
        id         = Convert.ToInt32(r["id"]),
        username   = r["username"].ToString(),
        fullName   = r["full_name"].ToString(),
        email      = r["email"].ToString(),
        role       = r["role"].ToString(),
        department = r["department"].ToString(),
        isActive   = Convert.ToBoolean(r["is_active"]),
        createdAt  = Convert.ToDateTime(r["created_at"])
    };

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var connStr = _config.GetConnectionString("DefaultConnection");
        using var conn = new MySqlConnection(connStr);
        await conn.OpenAsync();

        using var cmd = new MySqlCommand(
            "SELECT id, username, full_name, email, role, department, is_active, created_at FROM crm_users",
            conn);

        var users = new List<object>();
        using var reader = (MySqlDataReader)await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            users.Add(MapUser(reader));

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var connStr = _config.GetConnectionString("DefaultConnection");
        using var conn = new MySqlConnection(connStr);
        await conn.OpenAsync();

        using var cmd = new MySqlCommand(
            "SELECT id, username, full_name, email, role, department, is_active, created_at FROM crm_users WHERE id=@id",
            conn);
        cmd.Parameters.AddWithValue("@id", id);

        using var reader = (MySqlDataReader)await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return NotFound();

        return Ok(MapUser(reader));
    }
}
