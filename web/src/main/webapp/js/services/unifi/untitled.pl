#!/usr/bin/perl
use strict;
use Getopt::Std;

# netinv will dump a list of hosts on the local subnet based
# on your ARP cache. Output by default includes the vendor
# and netbios name.

my $VERSION='0.2';


# See if we have the Net::MAC::Vendor package
# and set vlookup to true if we do
#
BEGIN {
    $main::vlookup=0;
    my $mod='Net::MAC::Vendor';
	eval "use $mod";
	if ($@) {
        warn "You don't have the $mod module - $0 will use it's own feeble version.\n";
		$main::vlookup = 2;
	} else {
		$main::vlookup = 1;
    }
}

# main()
#

# Handle command line options
#

my %opts;
getopts('lhtvn', \%opts);
if (defined($opts{h})) {
	print &lt;&lt;"EOM";
$0 [options]
	-h		Display usage
	-l		Include local system
	-t		Condensed tab separated output
	-v		Do not do vendor lookups
	-n		Do not do netbios lookups
EOM
	exit(1);
}

my $vlookup  = (defined($opts{v})) ? 0 : $main::vlookup;
my $nblookup = (defined($opts{n})) ? 0 : 1;
my $tsv = (defined($opts{t})) ? 1 : 0;


# Read ARP cache and lookup vendor for the MAC
# and netbios name for the IP
#

my @hostlist=ReadARP();

if (defined($opts{l})) {
  my ($ip,$mac)=get_localNIC();
  if ($ip &amp;&amp; $mac) {
    my %itm;
	$itm{mac}=$mac;
	$itm{ip}=$ip;
	my $tmp=`hostname`;
	chop($tmp);
	$itm{name}=$tmp;
    unshift(@hostlist,\%itm);
  }
}

for my $itm (@hostlist) {
  $itm-&gt;{vendor} = 'unknown' if (0==$vlookup);
  $itm-&gt;{vendor} = @{Net::MAC::Vendor::lookup( $itm-&gt;{mac} )}[0] if (1==$vlookup);
  $itm-&gt;{vendor} = netinv_mac2vendor ( $itm-&gt;{mac} ) if (2==$vlookup);
  $itm-&gt;{nbname} = $nblookup ? nb_name( $itm-&gt;{ip} ) : 'unknown';
}

# Add our header to the output list if we're not
# doing condensed tab mode
#
unshift(@hostlist, (
  { 'ip' =&gt; 'IP', 'mac' =&gt; 'MAC', 'name' =&gt; 'DNSname', 'nbname' =&gt; 'NBname', 'vendor' =&gt; "Vendor"},
  { 'ip' =&gt; "-" x 10, 'mac' =&gt; "-" x 10, 'name' =&gt; "-" x 10, 'nbname' =&gt; "-" x 10, 'vendor' =&gt; "-" x 10},
)) if (! $tsv);


# Generate output
#
for my $itm (@hostlist) {
	if ($tsv) {
		print join("\t",
			$itm-&gt;{ip}, $itm-&gt;{mac}, $itm-&gt;{name},
			$itm-&gt;{nbname}, $itm-&gt;{vendor}) . "\n";
	} else {
		printf "%-17s%-17s\t%-13s\t%-13s\t%-16s\t%s\n",
			$itm-&gt;{ip}, $itm-&gt;{mac}, $itm-&gt;{name},
			$itm-&gt;{nbname}, $itm-&gt;{vendor};
	}
}
exit(0);


#############################################
# Subroutines only below here
#


# Get a list of current entries from the ARP cache
#

sub ReadARP {
	my @result;
	my @arplines = `arp -a`;
	foreach (@arplines) {
		# dell (192.168.0.60) at 0:4:76:da:87:fd on en0 [ethernet]
		next if (m#\(incomplete\)#);
		if (m#^(\S+)\s+\(([^\)]+)\)\s+at\s+(\S+)#) {
			my %itm;
			$itm{mac} = $3; $itm{ip}=$2; $itm{name}=$1;
			push(@result,\%itm);
		}
	}
	return (@result);
}

# Given an IP try to determine its' netbios name
# I chose to not use Net::NBName on purpose!
#

sub nb_name {
  my ($ip) = @_;
  my $result='';

  my @nblines = `nmblookup -A $ip`;
  foreach (@nblines) {
	#        PIZZA           &lt;00&gt; -         B <active> 
    next if (! m#&lt;00&gt;#);
    next if ( m#<group>#);
    $result=$1 if (m#^\t*(\S+)#);
  }
  return $result;
}




# our own feeble MAC to vendor implementation for
# those who don't have the module
#

sub netinv_mac2vendor {
	my $mac = shift;
    my @bits = split /[:-]/, $mac;
    $mac = join "-", map { sprintf "%02X", hex } @bits[0..2];

	# go curl
	my @clines = `curl -s "http://standards.ieee.org/cgi-bin/ouisearch?$mac"`;
	foreach (@clines) {
		if (m#^<hr><p></p><pre><b>(.*)#) {
			my $line=$1;
			$line =~ s#.*\(hex\)\s+##;
			return($line)
		}
	}
	return "unknown";
}

# our own VERY FEEBLE way to find the local system's IP and MAC
# from the output of OSX ifconfig
#

sub get_localNIC {
	my @iflines = `ifconfig`;
	my $ip='';
	my $mac='';

	foreach (@iflines) {
		$ip=$1 if (m#inet\s(\S+)#);
		$mac=$1 if (m#ether\s(\S+)#);
		if (m#status: active#) {
			return ($ip,$mac);
		}
	}
	return ('','');
}